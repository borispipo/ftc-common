/*** fix IE 11 : fetch  is undefined with fetch polyfill @see : https://github.com/github/fetch */
import 'whatwg-fetch'
import {isElectron} from "$cplatform";
import {extendObj} from "$cutils";
import DateLib from "$date";
import {getDBName,getDBNamePrefix,sanitizeDBName,parseDBName,isDocUpdate,isTableLocked,POUCH_DATABASES} from "./utils";
import actions from "$cactions";
import { sanitizeName,isCommon } from './dataFileManager/utils';
import { getLoggedUser} from '$cauth/utils';
import uniqid from "./pouchdb/plugins/uniqid";
import createDefaultIndexes from "./pouchdb/plugins/createDefaultIndexes";
import getRealName from "./pouchdb/plugins/getRealName";
import toJSON from "./pouchdb/plugins/toJSON";
import {structDataDBName } from "./dataFileManager/structData";
import {triggerEventTableName} from "./dataFileManager/structData";
import canOverrideRemove from "./pouchdb/plugins/canOverrideRemove";
import "./polyfill";

import PouchObj from "./pouchdb";

const {PouchDB,...pouchdbRest} = PouchObj;    

if(typeof window !== 'undefined' && !window.PouchDB){
    Object.defineProperties(window,{
        PouchDB : {value:PouchDB,override:false,writable:false}
    })
}

import QMapReduce from "./pouchdb/plugins/queryMapReduce";
import PouchDBFind from "./pouchdb/plugins/find";
PouchDB.plugin(PouchDBFind);
PouchDB.plugin(require('pouchdb-authentication'));
PouchDB.plugin(require('pouchdb-erase'));
PouchDB.plugin(canOverrideRemove);
PouchDB.plugin(QMapReduce);
PouchDB.plugin({
    uniqid,
    createDefaultIndexes,
    getRealName,
    toJSON,
});

let hasInitAppEvents = false;

if(!isObj(window.___TRIGGER_CHANGES_DBS)){
    Object.defineProperties(window,{
        ___TRIGGER_CHANGES_DBS : {value:{},override:false}
    })
}

if(!window.hasSetPouchEventsGetDB){
    window.hasSetPouchEventsGetDB = true;
    PouchDB.on('destroyed', function (dbName) {
        // called whenever a db is destroyed.
        dbName = sanitizeName(dbName.ltrim(getDBNamePrefix()));
        const DATABASES = POUCH_DATABASES.get();
        APP.trigger(APP.EVENTS.REMOVE_DATABASE,dbName);
        if(DATABASES[dbName]){
            let db = DATABASES[dbName];
            if(db.changesResult && isFunction(db.changesResult.cancel)){
                db.changesResult.cancel();
            }
            DATABASES[dbName] = db.changes = null;
            db = null;
            gc();
        }
    });
}
//upsert plugin
export function upsertInner(db, docId, diffFun,options) {
    return db.get(docId).catch(function (err) {
        /* istanbul ignore next */
        if (err.status !== 404) {
            throw err;
        }
        return {};
        //return err;
    }).then(function (doc) {
        let docRev = doc._rev;
        let newDoc = diffFun(doc,docId); 
        if (!isObj(newDoc)) {
            // if the diffFun returns falsy, we short-circuit as
            // an optimization
            return { updated: false, rev: docRev, id: docId };
        }
        for(let i in newDoc){
            if((i.startsWith("_") && i !== '_deleted') || (Array.isArray(newDoc[i]) && newDoc[i].length <= 0)){
                delete newDoc[i];
            }
        }
        newDoc._id = docId;
        newDoc._rev = docRev;
        addDefaultFields(newDoc,options);
        newDoc.dbId = defaultStr(newDoc.dbId,db.realName,undefined);
        //end ms-update;
        return tryAndPut(db, newDoc, diffFun,options)
    });
}

/** ms-update, add options parameters : options représente les options à passer lors
* de l'enregistrement de la mise à jour d'une bd pouchdb
*  
*/
export function tryAndPut(db, doc, diffFun,options) {
    if(!isObj(options) ){
        options = {};
    }
    return db.put(doc,options).then(function (res) {
        doc._rev = res.rev;
        let t= {
            updated: true,
            _rev: res.rev,
            _id: doc._id,
            doc : doc,
            newDoc : doc
        };
        return t;
    }).catch(function (err) {
        /* istanbul ignore next */
        if (err.status !== 409) {
            throw err;
        }
        return upsertInner(db, doc._id, diffFun,options);
    });
}

/*** ajoute les champs par défaut au moment de la mise à jour d'un document
 * l'on peut décider de modifier où de ne pas modifier les 
 *  date de mise à jour, les dates de modification et la personnes qui a modifié le document
 */
export function addDefaultFields(newDoc,options){
    ///l'on peut dorénavant interdire l'ajout de certains champs par défaut lors de la mise à jour des données par défaut aux données lors de l'insertion
    options = isObj(options)? options : {};
    let user = getLoggedUser();
    if(user){
        newDoc.createdBy = defaultStr(newDoc.createdBy,user.code)
        if(options.updatedBy !== false || !isNonNullString(newDoc.updatedBy)){
            newDoc.updatedBy = defaultStr(user.code,newDoc.updatedBy)
        }
    }
    //ms-update prerequise update for all type of field db
    let date = DateLib.SQLDate();
    let time = DateLib.SQLTime();
    newDoc.createdDate = defaultStr(newDoc.createdDate,date);
    newDoc.createdHour = defaultStr(newDoc.createdHour,time);
    if(options.updatedDate !== false || !isNonNullString(newDoc.updatedDate)){
        newDoc.updatedDate = date;
    }
    if(options.updatedHour !== false || !isNonNullString(newDoc.updatedHour)){
            newDoc.updatedHour = time;
    }
    /**** dans le document, est enregistré l'id du premier device l'ayant enregistré */
    newDoc.uuid = defaultStr(newDoc.uuid,APP.DEVICE.uuid);
    return newDoc;
}
const upsertVar = {};
/** 
    insert ou met à niveau la données dans la bd : 
    @param docId : string : null où l'id du document à mettre à jour
    @param diffFun, function : la fonction de rappel permettant de retourner la différence avec le contenu du document trouvé
    @param cb : function : la fonction de rappell appelée lorsque l'opération s'est déroulée avec succès
    @param options : options de la base de données tel que recommandées par pouchdb
    - si options est une fonction alors options joue le rôle de fonction de rappel 
    -si docId est une chaine de caractère, alors diffFunction sera obligatoire et appelée pour modifier la donnée trouvée
    varientes : 
        docId,diffFunction,callback,pouchdbOptions
        docId,diffFunction,callback,callbackError
        docId,
        upsert(_id,function(doc,docId){
            return {docUpdate1,docUpdate2,}
        }).then(function(){})

*/
upsertVar.upsert = function upsert(docId, diffFun, cb,options) {
    var db = this;
    var callbackErr = x=>{};
    if(!isFunction(diffFun) || !isNonNullString(docId)){
        let msg = "Upsertvar : impossible d'insérer la valer en base car la fonction diffFunc du plugin upsertVar est non définit ou l'id de la données est invalide";
        throw msg;
    }
    docId = docId.toUpperCase();
    if(isObj(cb)){
        options = isObj(options)? options : cb;
        cb = null;
    }
    if(isFunction(options)){
        callbackErr = options;
        options = null;
    }
    if(!isObj(options)){
        options = {};
    }
    var promise = upsertInner(db, docId, diffFun,options);
    if (typeof cb !== 'function') {
        return promise;
    }
    return promise.then(function (resp) {
            cb(resp);
    },callbackErr);
};

PouchDB.plugin(upsertVar);
//end upsert plugin

    /**** la fonction trimIdField a pour rôle, de retirer les id préfixés par le nom de la table sur la valeur
 *  passé en paramètre : 
 *  @param : value, string, chaine de caractère sur laquelle éliminer le préfix
 *  @param : table, string, le nom de la table vers laquelle a été définit l'id 
 *  exempl: : db.trimIDField ('THIRD_PARTIES/CLIENT','THIRD_PARTIES') => CLIENT
 */
export const trimIDField = function(value,table){
    let prefix = defaultStr(table).toUpperCase().trim();
    value = defaultStr(value);
    let split = value.split("/");
    if(split[0].toUpperCase().trim() == prefix ){
        let v = '';
        for(let i = 1; i < split.length; i++){
            v+= (v? '/':'')+split[i];
        }
        return v;
    }
    return value;
}

if(!isFunction(window.trimIdField)){
    Object.defineProperties(window,{
        trimIdField : {value:trimIDField,override:false,writable:false},
        trimIDField : {value:trimIDField,override:false,writable:false},
    })
}

export const getIdField = function(value,table,successCb,errorCb){
    if(isFunction(table)){
        if(isFunction(successCb)){
            errorCb = errorCb || successCb;
        }
        successCb = table;
        table = undefined;
    }
    let prefix = defaultStr(table).toUpperCase().trim()
    value = this.trimIdField(value,table);
    if(isNonNullString(prefix)){
        value = prefix.rtrim("/")+"/"+value;
    }
    return new Promise((resolve,reject)=>{
        this.get(value).then((v)=>{
            if(isFunction(successCb)){
                successCb(v);
            } else resolve(v);
        }).catch((e)=>{
            if(isFunction(errorCb)){
                errorCb(e);
            } else {
                reject(e);
            }
        })
    })
};

PouchDB.plugin({
    getIdField,
    getIDField : getIdField,
    getFieldId : getIdField,
    trimIDField,
    getName : function(){
        return this? defaultStr(this.realName).ltrim(getDBNamePrefix()) : '';
    },
    archive : function(data){
        let _dataArray = [];
        if(isArray(data)){
            data.map((dat,i)=>{
                if(isDocUpdate(dat)){
                    dat.archived = 1;
                    _dataArray.push(dat);
                }
            })
        } else if(isDocUpdate(data)){
            data.archived = 1;
            _dataArray.push(data);
        }
        showPreloader("archivage en cours...")
        return this.bulkDocs(_dataArray).finally((r)=>{
            hidePreloader();
            return r;
        });
    },
    trimIdField : trimIDField,
});
export const getTriggerDBTableName  = (doc)=>{
    doc = isObj(doc) && isDocUpdate(doc.doc)? doc.doc : doc; 
    return isObj(doc)? defaultStr(doc.table,doc.tableName,"DB_UNKNOW_TABLE") : undefined;
}
/***** Effectue le trigger en cas d'opération sur la base de données */
export const triggerDB = ({doc,db,isDelete,deleted}) =>{
    if(isObj(doc) && isNonNullString(doc._id) && isNonNullString(doc._rev)){
        let tableName = getTriggerDBTableName(doc);
        if(isNonNullString(db.realName) && db.realName.trim().toLowerCase() == structDataDBName.toLowerCase().trim()){
            tableName = triggerEventTableName(tableName);
        }
        let isDBLocked = db && isFunction(db.isLocked) && db.isLocked() ? true : false;
        let action = actions.upsert(tableName);
        let arg = {data:doc,isDBLocked,isTableLocked:isTableLocked(tableName) ? true : isDBLocked ? true : false,deleted,tableName,table:tableName,db,dbName:db.realName};
        if(isDelete){
            action = actions.onRemove(tableName);
        }
        APP.trigger(action,arg);
        return true;
    }
    return false;
}

const initDB = ({db,pDBName,realName,localName,settings,isServer}) =>{
    let {changes} = settings;
    let {remove} = db;
    db.localName = localName;
    db.isRemoteServer = db.isRemote = isServer ? true : false;
    const DATABASES = POUCH_DATABASES.get();
    if(isNonNullString(realName) && !db.realName) {
        realName = realName.ltrim(getDBNamePrefix());
        Object.defineProperties(db,{
            realName : {value:realName,override:false,writable:false}
        });
    }
    if(settings.willSkip){
        Object.defineProperties(db,{
            initialize : {
                value : x => db.login(settings.username, settings.password),override:false,writable:false
            }
        });
        db.initialize();
    } else {
        Object.defineProperties(db,{
            initialize : {
                value : x => Promise.resolve(),override:false ,writable:false
            }
        })
    }
    if(!db.isRemoteServer){
        const sDBName = sanitizeName(db.getName());
        if(DATABASES[sDBName]){
            return Promise.resolve(DATABASES[sDBName]);
        }
        const _remove = function({context,doc,force}){
            if(!isBool(force)){
                ///par défaut, toutes les documents du fichier de données communes sont supprimées
                force = isCommon(context.getName());
            }
            const sCB = (deleted)=>{
                if(!isObj(doc) || !isNonNullString(doc._id)){
                    doc = deleted;
                }
                triggerDB({db,deleted,doc,isDelete:true});
                return deleted;
            }
            if(force !== true && isObj(doc) && isNonNullString(doc._id)){
                return context.upsert(doc._id,(newDoc)=>{
                    return {...newDoc,...doc,_deleted:true};
                }).then((up)=>{
                    return sCB(up.newDoc);
                });
            }
            return remove.call(context,doc).then(sCB);
        }
        if(db.canOverrideRemove({pDBName})){
            db.remove = function(){
                let args = Array.prototype.slice.call(arguments,0);
                let doc = args[0];
                let force = args[1];
                let context = this;
                if(isNonNullString(doc)){
                    return new Promise((resolve,reject)=>{
                        db.get(doc).then((_doc)=>{
                            args[0] = _doc;
                            return _remove({context,args,doc:_doc,force}).then((resolve)).catch((reject));
                        }).catch(reject);
                    });
                }
                return _remove({context,args,doc,force});
            }
        }
        //db.setMaxListeners(20);
        db.changesResult = db.changes(extendObj(true,{},changes,{since: 'now',live: true,include_docs: true}))
        .on('change', function(change) {
            let tableName = getTriggerDBTableName(change);
            if(!tableName) return;
            tableName = tableName.toUpperCase().trim();
            let dbName = pDBName.toLowerCase().trim();
            db.lastChangeResult = change;
            window.___TRIGGER_CHANGES_DBS[dbName] = defaultObj(window.___TRIGGER_CHANGES_DBS[dbName]);
            window.___TRIGGER_CHANGES_DBS[dbName][tableName] = defaultDecimal(window.___TRIGGER_CHANGES_DBS[dbName][tableName]);
            let lastChangeStart = window.___TRIGGER_CHANGES_DBS[dbName][tableName];
            if(isDecimal(lastChangeStart) && lastChangeStart > 0) return;
            window.___TRIGGER_CHANGES_DBS[dbName][tableName] = new Date().getTime();
            setTimeout(()=>{
                window.___TRIGGER_CHANGES_DBS[dbName][tableName] = undefined;
                if(isObj(db.lastChangeResult) && !db.lastChangeResult.deleted){//on évite les actions de suppression car supprimé par l'autre
                    let doc = db.lastChangeResult.doc;
                    triggerDB({db,doc,isDelete:false});
                }
            },10);
        });
        db.fullDBName = pDBName;
        DATABASES[sDBName] = db;
        return new Promise((resolve,reject)=>{
            db.createDefaultIndexes({dbName:sDBName}).finally(()=>{
                resolve(db);
            })
        })
    }
    return Promise.resolve(db);
}

//end uniqid plugin
/**** cré une instance pouchDB à partir des options passés en paramètre
 *  @param options {object} de la forme : 
 *      {
 *          dbName| name : le nom de la bb,
 *          ... les autres options recommandés par pouchdb,
 *          ... changes : si l'on écoutera les évènements de la base de données, les options à passer
 *  }
 *  @return {PouchDB} instance de pouchdb Créé
 */
const newPouchDB = (options)=>{
    options = defaultObj(options);
    let settings = {auto_compaction: true,size:10000000,revs_limit1:100,...options};
    let pDBName = defaultStr(options.dbName,options.name);
    options.dbName = pDBName;
    const {realName} = options;
    const parse = parseDBName(options);
    delete options.name; delete options.dbName;
    let {server} = parse;
    const isServer = isValidUrl(server);
    pDBName = sanitizeDBName(parse.dbName,isServer);
    let localDBName = pDBName;
    if(isServer) {
        pDBName = urlJoin(server,pDBName).rtrim("/");
        delete settings.adapter;
        let {username,password} = settings;
        if(isNonNullString(username) || isNonNullString(password)){
            settings.auth = {...defaultObj(settings.auth),username,password};
        }
    }  else {
        pDBName = localDBName
    }
    let willSkip = isValidUrl(pDBName) && isNonNullString(settings.username) && isNonNullString(settings.password);
    if(willSkip){
        settings.skipSetup = false;
    }
    let args = {settings,pDBName,localName:localDBName};
    if(!isServer && isElectron()){
        pDBName =pDBName.rtrim(".db")+".db";
    }
    args.db = new PouchDB(pDBName, settings);
    args.isServer = isServer;
    args.skipSetup = willSkip;
    args.realName = realName;
    return initDB(args);
}   

const resolveDB = (dbName,callback,options,error)=>{
    const DATABASES = POUCH_DATABASES.get();
    options = defaultObj(options);
    let {force} = options;
    const realName = dbName;
    if(!isNonNullString(dbName)){
        console.warn(dbName,' The dbName must be a non null string');
        if(isFunction(error)){
            return error({
                msg : 'The dbName must be a non null string'
            });
        }
        return Promise.reject({
            msg : 'The dbName must be a non null string'
        });
    }
    let db;
    if(options && isValidUrl(options.server) || isValidUrl(dbName)){
        force = true;
    }
    dbName = sanitizeName(dbName);
    if(force !== true && DATABASES[dbName] != null  && isFunction(DATABASES[dbName].upsert)){
        db = DATABASES[dbName];
        return new Promise((resolve,reject)=>{
            db.info().then(() => {
                if(typeof callback === 'function'){
                    callback({db,dbName});
                }
                resolve({db,dbName,realName}); 
            })
            .catch(e => {
                resolveDBWithPromise(dbName,(args)=>{
                    if(isFunction(callback)){
                        callback(args);
                    } 
                    resolve(args);
                },realName);
            });
        })

    }
    return resolveDBWithPromise(dbName,callback,realName,options);
}

const resolveDBWithPromise = (dbName,callback,realName,options) =>{
    options = defaultObj(options);
    return newPouchDB({...defaultObj(pouchdbRest),...options,dbName,realName}).then((db)=>{
        db.NAME = db.Name = dbName;
        const DATABASES = POUCH_DATABASES.get()
        if(db.isRemoteServer){
        
        } else {
            DATABASES[dbName] = db; 
        }
        
        if(typeof callback === 'function'){
            callback({db,dbName,realName});
        }
        return ({db,dbName,realName});
    });
} 

/*** retourne la base de données
    @param : callback : la fonction de rappel
    @param : dbName : le nom de la bd
    @param : options : les options supplémentaires à appliquer

    ou encoure : @param : {
        name : le nom de la bd
        callback || success : la fonction de rappel en cas de succès
        error || la fonction de rappel en cas d'erreur
        adapter : le nom de l'adapter,
        ...rest
    }
    */
export default function getDB (callback,dbName,options1){
    if(!hasInitAppEvents && window.APP && isFunction(APP.off)){
        hasInitAppEvents = true;
    }
    let dbOpts = {};
    if(isObj(callback)){
        dbOpts = callback;
    } else if(isFunction(callback)){
        dbOpts = {
            callback
        }
        callback = undefined;
    } 
    
    dbOpts = {...defaultObj(dbOpts),...defaultObj(options1)};
    if(isNonNullString(callback)){
        dbOpts.dbName = callback;
    } else if(isFunction(callback)){
        dbOpts.callback = callback;
    }
    
    if(isNonNullString(dbName)){
        dbOpts.dbName = dbName;
    } else if(isFunction(dbName)){
        dbOpts.callback = dbName;
    }
    dbOpts.dbName = defaultStr(dbOpts.dbName,dbOpts.name);
    let {db,name,success,error,...options} = dbOpts;
    callback = isFunction(dbOpts.callback)? dbOpts.callback : defaultVal(success,callback);
    dbName = defaultStr(dbName,dbOpts.dbName,db,name);
    let tbl = defaultStr(dbOpts.table,dbOpts.tableName);
    if(tbl){
        dbName = sanitizeName(dbName,tbl);
    }
    delete dbOpts.dbName;
    options = defaultObj(options);
    delete dbOpts.callback;
    dbName = getDBName(dbName);
    if(!isNonNullString(dbName) || arrayValueExists(['default','current'],dbName.toLowerCase())){
        return reject({status:false,msg:'You must specify database name'})
    } 
    return resolveDB(dbName,callback,options,error) 
}
export {getDBNamePrefix,PouchDB,getDB};