import getDB from "./_getDB";
import { getDBOptions } from "./_getDB";
import {isValidUrl,isObj} from "$cutils";
import localConf from "./localServerConfig";
import "./localServer";
import "./getData";

export default function getDBUsingLocalServer(dbName,options){
    const opts = getDBOptions(dbName,options);
    const {server} = opts;
    if(isValidUrl(server) || !localConf.isSet) return getDB(opts);
    return new Promise((resolve,reject)=>{
        return Promise.all([
            getDB(opts).catch(reject),
            //getting local server settings server
            new Promise((success)=>{
                getDB({...opts,...localConf,server:localConf.url,isServer:true}).then(success).catch((e)=>{
                    console.error("unable to get {0} loal server database with options".sprintf(opts.dbName),opts);
                    success(null);
                });
            })
        ]).then((localArgs,remoteArgs)=>{
            const {db} = localArgs;
            if(isObj(remoteArgs) && remoteArgs.db && remoteArgs.db.find){
                if(!db.localServer || !db.localServer?.allDocs || !db.localServer?.get){
                    Object.defineProperties(db,{
                        localServer : {
                            value : remoteArgs.db,
                        }
                    });
                }
            }
        });
    })
}

export {getDBUsingLocalServer as getDB};

export * from "./_getDB";