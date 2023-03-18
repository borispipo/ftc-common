import getDB from "$pouchdb/getDB/getDB";
import dbName from "./dbName";
import {extendObj} from "$cutils";
export default function getDataFileDB(opts1,opts2){
    return getDB(extendObj({},opts1,opts2,{
        dbName,
        name : dbName,
        isDataFileManager:true
    })).then((result)=>{
        if(typeof result.db.getInfos !='function'){
            result.db.getInfos = function(){
                return Promise.resolve(extendObj({},db.infos,{isDataFileManager:true,isManager:true}));
            }.bind(db);
        }
        return result;
    });
}