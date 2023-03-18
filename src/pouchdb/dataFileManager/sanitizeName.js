import {isNonNullString,sanitizeFileName} from "$cutils";
import CONSTANTS from "$pouchdb/constants";
import dataFileDBName from "./dbName";
import isDataFileDBName from "./isDataFileDBName";

export default function sanitizeName (dFName){
    if(isNonNullString(dFName)){
        dFName = dFName.toLowerCase().trim();
        const normalizedDFName = dFName.replaceAll(" ","").replaceAll("-","").replaceAll("_","");
        if(isDataFileDBName(dFName)) {
            dFName = dataFileDBName;
        } else if(['common',"commondb"].includes(normalizedDFName)){
            dFName = CONSTANTS.COMMON_DB;
        } else if(normalizedDFName == 'structdata'){
            dFName = 'struct_data';
        } else if(dFName =="default"){
            dFName = "";
        }
        return sanitizeFileName(dFName).toLowerCase();
    }
    return "";
}