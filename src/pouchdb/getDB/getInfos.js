import { PouchDB } from "./pouchdb";
import fetch from "../dataFileManager/fetch";
import isValidDataFile from "../dataFileManager/isValidDataFile";
import sanitizeDBName from "../utils/sanitizeDBName";
import {extendObj,defaultStr} from "$cutils";

PouchDB.plugin({
    getInfos : function(){
        const db = this;
        return fetch().then((dataFiles)=>{
            for(let code in dataFiles){
                const dF = dataFiles[code];
                if(!isValidDataFile(dF)) continue;
                if(sanitizeDBName(dF.code) === sanitizeDBName(defaultStr(db.getName(),db.infos?.realName))){
                    extendObj(db.infos,dF,{realName:db.infos?.realName,name:dF.code,type:dF.type});
                    return db.infos;
                }
            }
            return db.infos;
        });
    }
});