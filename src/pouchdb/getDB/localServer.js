import { PouchDB } from "./pouchDB";
import localServerConfig from "./localServerConfig";
import APP from "$capp/instance";

function getLocalServer(){
    const db = this || {};
    if(!db.localServer || typeof db.localServer =='boolean' || typeof db.localServer =='number' || !db.localServer?.allDocs || !db.localServer?.get) return null;
    return db.localServer;
}

function syncOnLocalServer(){
    if(!this.hasLocalServer()){
        return Promise.reject({
            message : 'local server not configurated on the application'
        })
    }
    const db = this;
    const name = defaultStr(db.infos?.name,db.getName());
    const type = defaultStr(db.infos?.type);
    const typeSep = type ? (","+type) : "";
    const dbText = "{0}{1}".sprintf(name,typeSep);
    if((db.infos?.isServer)){
        return Promise.reject({message:"Could not sync local server db {0} with another server".sprintf(dbText)});
    }
    if(!type){
        return Promise.reject({message:'Invalid db type, unable to sync the database {0} with local server'.sprintf(dbText)})
    }
    if(localServerConfig.status){
        return Promise.reject({message:'could not db {0} sync with local server, it is disabled on the application'.sprintf(dbText)})
    }
    if(this.isLocalServer){
        return Promise.reject({message:'Canot sync local sever with him, same database {0}'.sprintf(dbText)});
    }
    const syncTypes = localServerConfig.syncData;
    if(syncTypes.length && !syncTypes.includes(type)){
        return Promise.reject({message:'Could not sync db{0} because its type {1} is not allowed to sync on local server'.sprintf(dbText,type)})
    }
    const databases = localServerConfig.databases;
    if(databases.length && !databases.includes(name)){
        return Promise.reject({message:'Could not sync db{0} because its name {1} is not allowed to sync on local server'.sprintf(dbText,name)})
    }
    return new Promise((resolve,reject)=>{
        /// on peut faire la synchronisation avec le serveur local, si les paramètres de bases de données sont synchronisées avec le serveur local
        setTimeout(()=>{
            const localServer = db.getLocalServer()
            if(localServer && localServer?.allDocs && localServer.get){
                const cb = ()=>{
                    return db.sync(localServer).catch((e)=>{
                        console.error("sync {0} with local server ".sprintf(db.infos?.name),e);
                        reject(e);
                    }).then(resolve);
                }
                if(localServerConfig.local || APP.isOnline()){
                    cb();
                } else APP.checkOnline().catch(e=>e).finally(cb);
            }
        },10);
    });
}

PouchDB.plugin({
    //retrieve local database associated to the current database
    getLocalServer,
    ///check wheather database has local server instance
    hasLocalServer : function(){
        return !!getLocalServer.call(this);
    },
    syncOnLocalServer,
    isLocalServer : function(){
        if(!this.infos?.isServer) return false;
        const url = defaultStr(this.infos.server,this.infos.serverUrl).toLowerCase().rtrim("/");
        return url && url === defaultStr(localServerConfig.url).trim().toLowerCase().rtrim("/") && true || false;
    }
});