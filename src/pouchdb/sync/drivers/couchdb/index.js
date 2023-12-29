import notify from "$notify";
import {getLabel,getAll as getAllDataFiles,sanitizeName,isValid} from "../../../dataFileManager/utils";
import isCommonDataFile from "../../../dataFileManager/isCommon";
import Background from "../../background";
import getDB,{PouchDB} from "$pouchdb/getDB";
import APP from "$app/instance";
import { getSyncOptions,normalizeSyncDirection,syncDirections } from "../../../sync/utils";
import {open as showPreloader,close as hidePreloader} from "$preloader";
import {getSyncProgressPreloaderProps} from "$active-platform/pouchdb";
import SignIn2SignOut,{getLoggedUser} from "$cauth/utils";
import isCommon from "../../../dataFileManager/isCommon";
import dataFile from "../../../dataFileManager/dataFile";
import fetch from "../../../dataFileManager/fetch";
/*** retourne une base de données couchdb :
 * @param : {mixted : string | object}
 *  {
 *      remote : si c'est une base distante, à utilisation internet
 *      local : si c'est une base locale, pas besoin d'internet pour l'accessibilité au server
 * }
 */
export const getCouchDB = function(dbName){
    let arg = Array.prototype.slice.call(arguments,0);
    let opts = {};
    if(isObj(dbName)){
        opts = dbName;
    } else if(isNonNullString(dbName)){
        opts = {dbName};
    }
    arg[0] = opts;
    return new Promise((resolve,reject)=>{
        //on compte 10 fois jusqu'à ce que l'application soit en ligne et on essaye à nouveau
        const success = x => {
            getDB.apply(getDB,arg).then((r)=>{
                resolve(r);
                r.db.initialize().then(x=>resolve(r)).catch((e)=>{
                    console.log(e,' unable to iniitialize couchdb');
                    reject({status:false,msg:"Impossible d'initialiser la base "+dbName,error:e,result:r});
                });
            }).catch((e)=>{
                console.log(e,' unable to get couchdb ',dbName,arg);
                reject({status:false,msg:'Impossible de récupérer la base '+dbName,error:e});
            });
        }
        if(opts.local === true || opts.remote === false || APP.isOnline()){
            success();
        } else {
            APP.checkOnline().then(success).catch((e)=>{
                console.log(e,' missing network connexion');
                reject({status:false,code:500,msg:'Connexion internet manquante',error:e});
            });
        }        
    })
}

let dbSyncManager = Background.getDBSyncManager();
export const replicate = ({source,onError,onActive,onResumed,onPaused,onChange,onComplete,target,cancel,method,preloaderContent,syncTypeText,preloaderTitle,...rest})=>{
    rest = getSyncOptions(rest); 
    let pendingMax = 0;
    let getProgress  = (pending) => {
        let progress;
        pendingMax = pendingMax < pending ? pending + rest.batch_size : pendingMax;  // first time capture
        if (pendingMax > 0) {
            progress = 1 - pending/pendingMax;
            if (pending === 0) {
                pendingMax = 0;    // reset for live/next replication
            }
        } else if(pendingMax == 0){
            progress = 0;
        } else {
            progress = 1;  // 100%
        }
        return Math.ceil(progress*100);
    }
    method = defaultStr(method,'replicate').toLowerCase();
    if(!arrayValueExists(['sync','replicate'],method)){
        method = 'replicate';
    }
    let scT = undefined;
    onChange = defaultFunc(onChange);
    onError = defaultFunc(onError);
    onComplete = defaultFunc(onComplete)
    onPaused = defaultFunc(onPaused);
    onActive = defaultFunc(onActive,onResumed)

    const showP = (info)=>{
        if(Background.isDBSyncBackground()) return;
        if(preloaderContent){
            showPreloader(getSyncProgressPreloaderProps({
                pending:getProgress(info.pending),
                title : preloaderTitle,
                content : preloaderContent,
                footer : [
                    {
                        text : 'Arrière plan',
                        title : 'Exécuter en arrière plan',
                        icon : 'arrange-send-backward',
                        action : ()=>{
                            hidePreloader();
                            Background.setDBSyncBackground(false);
                        }
                    },
                    cancel === false ? null: {
                        text :'Annuler',
                        icon : 'cancel',
                        action : ()=>{
                            if(scT && isFunction(scT.cancel)){
                                scT.cancel();
                            }
                            hidePreloader();
                            scT = undefined;
                        }
                    }
                ],
            }));
        }
    }
    scT =  PouchDB[method](source,target,rest);
    showP({pending:0});
    scT.on('denied', onError)
        .on('error', onError)
        .on('complete',onComplete)
        .on('paused', onPaused)
        .on('active',onActive)
        .on('change', (info)=>{
            let pending = info.pending;
            if(isObj(info) && isObj(info.change) && isNumber(info.change.pending)){
                info = info.change;
                pending = info.pending;
            }
            if(!isDecimal(pending)){
                scT.cancel();
                return onComplete(info, source.getName());
            }
            showP({pending});
            onChange(info);
            return info;
        })
    return scT;
}

const cMsg = (d,title,db)=>{
    let str = "";
    if(isObj(d)){
        if(isDecimal(d.docs_read) && d.docs_read){
            str+=" [Lectures : "+(d.docs_read.formatNumber())+"]";
        }
        if(isDecimal(d.docs_written) && d.docs_written){
            ///le nombre de document écrits
            str+=" [Ecritures : "+(d.docs_written.formatNumber())+"]";
        }
        if(str){
            str = defaultStr(title)+str
            str = getLabel(db.getName()).toUpperCase()+" "+str
        }
    }
    return str;
}

export const syncDB = (args)=>{
    let {code,_id,changedDatabases,syncID,syncFilter,isCommon,local,url,dbName,dbNameStr,syncType,allDatabasesSync,...rest} = args;
    rest = defaultObj(rest)
    let remoteDB = undefined;
    let localDB = undefined;
    let hasSyncChanged = false;
    changedDatabases = defaultObj(changedDatabases);
    const triggerAfterSync = (trigger)=>{
        if(localDB){
            localDB.unlock(trigger);
            /** à la fin de la synchronisation, on actualise la liste des fichiers de données de l'application, et on met à jour les informations sur la base de données */
            if(typeof localDB.getInfos =="function"){
                localDB.getInfos();
            }
        }
    }
    if(dbNameStr ===false){
        dbNameStr = "";
    } else {
        dbNameStr = defaultStr(dbNameStr,dbName);
    }
    let method = 'sync';
    let serverCode = defaultStr(code,_id);
    if(serverCode){
        serverCode = "sync serveur ["+serverCode+"]";
    }
    local = defaultVal(local,false)? true : false;
    return new Promise((_resolve,_reject)=>{
        let timeout = undefined;
        let syncContext = undefined;
        const errorF = (err)=>{
            clearTimeout(timeout);
            if(err){
                if(Background.isNotDBSyncBackground() && !dbSyncManager[syncID] && (isNonNullString(err) || (isObj(err) && (isNonNullString(err.msg) || isNonNullString(err.message))))){
                    dbSyncManager[syncID] = true;
                    notify.error(err);
                }
                _reject(err);
            }
            if(syncContext && isFunction(syncContext.cancel)){
                syncContext.cancel();
            }
            triggerAfterSync(false);
        }
        
        if(!APP.isOnline() && (local !== true && rest.remote !== false)){
            errorF("Veuillez vérifier votre connexion internet car celle-ci semble être instable")
            return;
        }
        const successF = (info)=>{
            clearTimeout(timeout);
            _resolve(info);
            if(isObj(allDatabasesSync)){
                allDatabasesSync[dbName]={syncType,date : new Date().toFormat("yyyy-mm-dd HH:MM:ss")};
            }
            triggerAfterSync(hasSyncChanged);
            if(syncContext && isFunction(syncContext.cancel)){
                syncContext.cancel();
            }
            APP.trigger(APP.EVENTS.SYNC_POUCHDB_DATABASE,{
                isCommon,
                dbNameStr,
                ...defaultObj(info),
                dbName,
            });
        }
        getCouchDB({dbName,server:url,serverCode:defaultStr(code,_id),serverSettings:rest,local,...rest}).then(({db})=>{
            remoteDB = db;
            const onComplete = function(completeArgs){
                let r = completeArgs.result;
                let textMsg = "";
                if(isObj(r) && dbNameStr){
                    textMsg +=textMsg?" ":"";
                    if(r.push){
                        textMsg+= cMsg(r.push,'Ajouts : ',db);
                    } else if(r.pull){
                        textMsg+= cMsg(r.pull,' Retraits : ',db);
                    } else if(isDecimal(r.docs_written) && isDecimal(r.docs_read)){
                        textMsg+= cMsg(r.pull,' Resultat : ',db);
                    } else textMsg = '';                    
                }
                textMsg = textMsg.trim();
                if(textMsg && Background.isNotDBSyncBackground()){
                    notify.success(textMsg);
                }
                successF(r);
                if(completeArgs.localDB && isFunction(completeArgs.localDB.getName) && isFunction(completeArgs.localDB.removeOldDocs) && isNonNullString(completeArgs.syncType)){
                    if(!defaultStr(completeArgs.localDB.getName()).toLowerCase().contains("online-devices")){
                        completeArgs.localDB.removeOldDocs({...rest,archived:true,syncType}).catch((e)=>{
                            if(e && !e.removingError){
                                console.log(e,' removing old data db=',dbName,", sync type ",syncType)
                            }
                        });
                    }
                }
            }
            return remoteDB.info().then(()=>{
                return getDB({dbName}).then(({db})=>{
                    db.lock();//on vérouille la base de données
                    localDB = db;
                    let target = remoteDB, source = localDB, 
                    filter = undefined;
                    syncFilter = defaultFunc(syncFilter,x=>true)
                    if(syncType =="desc"){
                        filter = syncFilter;
                    } else {
                        filter = (doc,req)=>{
                            if(!doc._deleted) return syncFilter(doc,req);
                            return doc.table || doc.uuid || doc.createdBy || doc.createdDate? syncFilter(doc,req) : false;
                        }
                    }
                    let syncTypeText = "Complète";
                    switch(syncType){
                        case 'asc':
                            method = 'replicate'
                            syncTypeText = 'Asc';
                            break;
                        case 'desc':
                            method = 'replicate'
                            syncTypeText = 'Desc';
                            target = localDB;
                            source = remoteDB;
                            break;
                    }
                    const preloaderTitle = serverCode;
                    const preloaderContent = (dbNameStr||'')+" ["+syncTypeText+"] :";
                    return replicate({...rest,
                        onError:errorF,
                        onChange:(info)=>{
                            hasSyncChanged = true;
                            changedDatabases[dbName] = true;
                            clearTimeout(timeout);
                        },
                        onPaused : ()=> clearTimeout(timeout),
                        onActive : ()=> clearTimeout(timeout),
                        onComplete : (args)=>{
                            clearTimeout(timeout);
                            onComplete({localDB,syncType,remoteDB,result:args});
                        },
                        live:false,retry:false,serverCode,filter,source,target,syncTypeText,preloaderTitle,method,preloaderContent,
                    });
                })
            }).catch((er)=>{
                console.log(er,' error on get remote db info for sync ',dbName," sync id is ",syncID);
                if(Background.isNotDBSyncBackground() && !dbSyncManager[syncID]){
                    dbSyncManager[syncID] = true;
                    notify.error("Impossible de synchroniser la base ["+dbNameStr+"]"+(isNonNullString(serverCode)? (", "+serverCode+""):"")+" : Vérifiez "+(local !==true?"votre connexion internet où les paramètres de ce serveur":"les paramètres de connexion à ce serveur")+" SVP!!!")
                }
                errorF(er);
            })
        }).catch((e)=>{
            console.log(e,' getting coudDB to sync ',dbName)
            errorF(e);
        })
    })
}

export default {
    init : ()=>{
        return this;
    },
    getDB : getCouchDB,
    /**** synchronise vers un serveur de données
     * @param {object} arg, de la forme : 
     * {
     *      syncDataTypes {Array|string}, tableau où chaine de caractère avec les éléments séparés par ##, représentant à gauche, le type de fichier de données et à droite, la direction de synchronisation
     *      databases {Array|string}, idem à syncDataTypes sauf qu'il s'agit des bases de données, à gauche, le nom du fichier de données et à droite la direction de synchronisation
     * }
     */
    sync : (arg)=>{
        arg = defaultObj(arg);
        let allDatabasesSync = {};
        const syncDataTypes = normalizeSyncDirection(arg.syncDataTypes);
        const databases = normalizeSyncDirection(arg.databases);
        const hasSyncTypes = Object.size(syncDataTypes,true);
        const hasDataBases = Object.size(databases,true);
        let promises = [];
        arg.syncID = uniqid("database-syncId")
        const allExistingDataFiles = {},commonDataFiles = {};
        let u = getLoggedUser();
        const isMasterA = SignIn2SignOut.isMasterAdmin();
        const dataFilesByTypes = {};
        getAllDataFiles((dF)=>{
            if(hasDataBases && !databases[dF.code]) return false;
            if(hasSyncTypes > 0 && !(syncDataTypes[dF.type])){
                return false;
            }
            if(!isCommon(dF.code) && !isMasterA && !isForUser(dF,u)){
                return false;
            }
            const type = defaultStr(dF.type);
            dataFilesByTypes[type] = defaultObj(dataFilesByTypes[type]);
            dataFilesByTypes[type][dF.code] = dF;
            allExistingDataFiles[dF.code] = dF;
            if(isCommonDataFile(dF)){
                commonDataFiles[dF.code] = dF;
            }
            return true;
        });
        const changedDatabases = allDatabasesSync.changes = {};
        /*** si aucun des choix n'est définit, c'est à dire, aucune base de données où aucun type de base de données n'est selectionné
         * alors rien ne sera opérationnel
         */
        if(hasDataBases){
            Object.map(databases,(dbName,syncType)=>{
                if(!isNonNullString(dbName) || !syncType || !syncDirections(syncType)) return null;
                const isCommon = !!(isCommonDataFile(dbName) || commonDataFiles[dbName]);
                dbName = sanitizeName(dbName,false);
                if(isCommon) {
                    for(let i in commonDataFiles){
                        const dF = commonDataFiles[i];
                        promises.push(syncDB({...arg,isCommon,changedDatabases,dbName:dF.code,syncType,dbNameStr:dF.label,allDatabasesSync}));
                    }
                } else {
                    let dF = allExistingDataFiles[dbName]
                    promises.push(syncDB({...arg,isCommon,changedDatabases,dbName,syncType,dbNameStr:dF.label,allDatabasesSync}));
                }
            });
        } else if(hasSyncTypes){
            Object.map(syncDataTypes,(dataFileType,syncType)=>{
                ///on synchronise les bases pour lesquelles les types ont été sélectionnées, y compris avec leur direction
                if(!isNonNullString(dataFileType) || !syncType || !syncDirections(syncType)) return null; 
                if(dataFilesByTypes[dataFileType]){
                    ////seules les bases de données dont le type a été spécifié, peuvent être synchronisées
                    Object.map(dataFilesByTypes[dataFileType],(dF,i)=>{
                        promises.push(syncDB({...arg,isCommon:isCommonDataFile(dF),changedDatabases,syncType,dbName:dF.code,dbNameStr:dF.label,allDatabasesSync}));
                    });
                } 
            })
        }
        
        ///always sync  datafile's manager as full sync
        promises.push(syncDB({...arg,isCommon:true,isDataFileManager:true,changedDatabases,syncType:"full",dbName:dataFile.code,dbNameStr:dataFile.label,allDatabasesSync}).then((r)=>{
            fetch();
            return r;
        }));
        return Promise.all(promises).then((r)=>{
            return allDatabasesSync;
        }).catch((e)=>{
            return e;
        }).finally((f)=>{
            delete dbSyncManager[arg.syncID]
            if(Background.isNotDBSyncBackground()) hidePreloader();
            return allDatabasesSync;
        });
    }
}
