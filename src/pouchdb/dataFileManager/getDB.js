import getDB from "$pouchdb/getDB";
import dbName from "./dbName";
import {extendObj} from "$cutils";
export default function getDataFileDB(opts1,opts2){
    return getDB(extendObj({},opts1,opts2,{
        dbName,
        name : dbName,
        isDataFileManager:true
    }));
}