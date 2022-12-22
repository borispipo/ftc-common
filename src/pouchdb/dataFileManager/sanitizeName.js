import {isNonNullString,defaultStr,sanitizeFileName} from "$cutils";
import commonDataFiles from "./commonDataFiles";
import getCurrentDB from "./getCurrentDB";
import CONSTANTS from "$pouchdb/constants";

export default function sanitizeName (dFName,sanitizeDefautName,tableName){
    if(isNonNullString(dFName)){
        dFName = dFName.toLowerCase().trim();
        tableName = defaultStr(tableName,sanitizeDefautName).toLowerCase().trim();
        if(tableName && commonDataFiles[tableName] && commonDataFiles[tableName].code){
            dFName = commonDataFiles[tableName].code;
        }
        dFName = dFName.toLowerCase();
        if(dFName == 'common' || dFName =="common-db" || dFName=="common_db"){
            dFName = CONSTANTS.COMMON_DB;
        } else if(dFName == 'structdata'){
            dFName = 'struct_data';
        } else if(dFName =="default" && sanitizeDefautName !== false){
            dFName = defaultStr(getCurrentDB()).toLowerCase().trim();
        }
        return sanitizeFileName(dFName).toLowerCase();
    }
    return "";
}