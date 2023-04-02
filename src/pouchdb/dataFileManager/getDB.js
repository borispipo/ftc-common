import getDB from "$pouchdb/getDB/getDB";
import dbName from "./dbName";
import {extendObj,isObj} from "$cutils";
export default function getDataFileDB(opts1,opts2){
    return getDB(extendObj({},opts1,opts2,{
        dbName,
        name : dbName,
        isDataFileManager:true
    })).then((result)=>{
        const db = result.db;
        if(!isObj(db.infos)){
            db.infos = {};
        }
        extendObj(db.infos,{name:dbName,code:dbName,isDataFileManager:true,isManager:true});
        if(typeof db.getInfos !='function'){
            db.getInfos = function(){
                return Promise.resolve(extendObj({},db.infos,{name:dbName,code:dbName,isDataFileManager:true,isManager:true}));
            }.bind(db);
        }
        return result;
    });
}