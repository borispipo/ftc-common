import {defaulStr,isNonNullString} from "$cutils";
import dataFileDBName from "./dbName";
const defDataFileName = dataFileDBName.toLowerCase().trim().replaceAll(" ","__").replaceAll(".","-");
/***
 * check if given database is data file db name
 */
export default function isDataFileDBName(dbName){
    if(!isNonNullString(dbName)){
        return false;
    }
    const sanitized = dbName.toLowerCase().replaceAll("-","").replaceAll("_","");
    return sanitized == defDataFileName || sanitized=="datafile" || sanitized ==="datafiles" ? true : false;
}