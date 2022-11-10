import notify from "$notify";
import {getLabel,getAll as getAllDataFiles,sanitizeName,isForUser} from "../../../dataFileManager/utils";
import isCommonDataFile from "../../../dataFileManager/isCommon";
import Background from "../../background";
import {isDesktopMedia} from "$dimensions";
import getDB,{PouchDB} from "$pouchdb/getDB";
import APP from "$app/instance";
import {open as showPreloader,close as hidePreloader} from "$preloader";
import {getSyncProgressPreloaderProps} from "$active-platform/pouchdb";
const uDBName = "users";
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
    rest = defaultObj(rest);
    let freeRAMHigher = APP.getFreeRAM()>4;
    rest.batches_limit = defaultNumber(rest.batches_limit,freeRAMHigher? 50 : 25)
    rest.timeout = defaultDecimal(rest.timeout,300); //temps d'attente à 0.5s
    rest.batch_size = defaultNumber(rest.batch_size,freeRAMHigher?300:APP.getFreeRAM()>2 ? 200 : isDesktopMedia()?150:100);  
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

let cMsg = (d,title,db)=>{
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

let syncDB = (args)=>{
    let {code,_id,changedDatabases,syncID,syncFilter,local,url,dbName,dbNameStr,syncType,allDatabasesSync,...rest} = args;
    rest = defaultObj(rest)
    let remoteDB = undefined;
    let localDB = undefined;
    let hasSyncChanged = false;
    changedDatabases = defaultObj(changedDatabases);
    const triggerAfterSync = (trigger)=>{
        if(localDB){
            localDB.unlock(trigger);
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
        let errorF = (err)=>{
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
        let successF = (info)=>{
            clearTimeout(timeout);
            _resolve(info);
            if(isObj(allDatabasesSync)){
                allDatabasesSync[dbName]={syncType,date : new Date().toFormat("yyyy-mm-dd HH:MM:ss")};
            }
            triggerAfterSync(hasSyncChanged);
            if(syncContext && isFunction(syncContext.cancel)){
                syncContext.cancel();
            }
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
                    if(isCommonDataFile(dbName)){
                        filter = (doc)=>{
                            if(!doc || doc._id == "ONLINES_DEVIES_ID") return false;
                            return syncFilter(doc);
                        }
                    } else {
                        if(syncType =="desc"){
                            filter = syncFilter;
                        } else {
                            filter = (doc,req)=>{
                                if(!doc._deleted) return syncFilter(doc,req);
                                return doc.table || doc.uuid || doc.createdBy || doc.createdDate? syncFilter(doc,req) : false;
                            }
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
    sync : (arg)=>{
        arg = defaultObj(arg);
        let allDatabasesSync = {};
        let {databases,syncDatabases} = arg;
        syncDatabases = defaultArray(syncDatabases);
        let promises = [];
        arg.syncID = uniqid("database-syncId")
        let sellersDF = {}, otherDBS = {}
        let u = Auth.getLoggedUser();
        let isMasterAdmin = Auth.isMasterAdmin();
        getAllDataFiles((dF)=>{
            if(syncDatabases.length > 0 && !arrayValueExists(syncDatabases,dF.code)){
                return;
            }
            if(dF.type == 'seller'){
                if(!isMasterAdmin && !syncDatabases.length && !isForUser(dF,u)){
                    return;
                }
                sellersDF[dF.code] = dF;
            } else  {
                otherDBS[dF.code] = dF;
            }
            return true;
        });
        const changedDatabases = allDatabasesSync.changes = {};
        Object.map(databases,(syncType,dbName)=>{
            if(!isNonNullString(dbName) || !arrayValueExists(['full','asc','desc'],syncType)) return null;
            let isCommon = isCommonDataFile(dbName);
            dbName = sanitizeName(dbName,false);
            if(dbName =="default"){
                ////seules les bases commerciales de l'apps seront synchronisées
                Object.map(sellersDF,(dF,i)=>{
                    promises.push(syncDB({...arg,changedDatabases,syncType,dbName:dF.code,dbNameStr:dF.label,allDatabasesSync}));
                });
            } else if(isCommon) {
                for(let i in otherDBS){
                    if(!isObj(otherDBS[i])) continue;
                    let dF = otherDBS[i];
                    const isCommonDB = isCommonDataFile(i);
                    const currentDBName = i;
                    if(isCommonDB || currentDBName == uDBName){
                        promises.push(syncDB({...arg,changedDatabases,dbName:i,syncType,dbNameStr:dF.label,allDatabasesSync}).then((args)=>{
                            if(changedDatabases[currentDBName] && (syncType =='full'|| syncType =='desc')){
                                APP.setCompanyData(true,false);
                                if(currentDBName === uDBName){
                                    Auth.getUser(Auth.getLoggedUserCode()).then((u)=>{
                                        if(u.status === 0){
                                            Auth.logout();
                                        } else {
                                            Auth.login(u,true);
                                        }
                                    });
                                }
                            }
                            return args;
                        }));
                    } else {
                        promises.push(syncDB({...arg,changedDatabases,dbName:dF.code,syncType,dbNameStr:dF.label,allDatabasesSync}))
                    }
                }
            } else {
                let dF = otherDBS[dbName]
                if(!dF) return null;
                promises.push(syncDB({...arg,changedDatabases,dbName,syncType,dbNameStr:dF.label,allDatabasesSync}));
            }
        })
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
