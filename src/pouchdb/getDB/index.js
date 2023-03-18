import getDBFunction,{PouchDB} from "./getDB";
import "./getInfos";

export * from "./pouchDB";
export * from "./getDB";

export default function getDB (dbName,opts){
    return new Promise((resolve,reject)=>{
        return getDBFunction(dbName,opts).then((rest)=>{
            return rest.db.getInfos().finally(()=>{
                resolve(rest);
            });
        }).catch(reject);
    })
}


export {getDB};