import { PouchDB } from "./pouchdb";
import localServerConfig from "./localServerConfig";
import {isNonNullString} from "$cutils";

function getLocalServer(){
    const db = this || {};
    if(!db.localServer || typeof db.localServer =='boolean' || typeof db.localServer =='number' || !db.localServer?.allDocs || !db.localServer?.get) return null;
    return db.localServer;
}

PouchDB.plugin({
    //retrieve local database associated to the current database
    getLocalServer,
    ///check wheather database has local server instance
    hasLocalServer : function(){
        return !!getLocalServer.call(this);
    },
    getLocalServerConfig : function(key){
        if(isNonNullString(key)){
            return localServerConfig[key];
        }
        return localServerConfig;
    },
    getConfigValue : function(...args){
        return this.getLocalServerConfig(...args);
    },
    isLocalServer : function(){
        if(!this.infos?.isServer) return false;
        const url = defaultStr(this.infos.server,this.infos.serverUrl).toLowerCase().rtrim("/");
        return url && url === defaultStr(localServerConfig.url).trim().toLowerCase().rtrim("/") && true || false;
    }
});