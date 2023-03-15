import {isFunction,isObj} from "$cutils";
import {getDB} from "./getDB";

export const dbName = "struct_data";//le nom de la base de données pour les struct-data;

export default function getStructDataDB (success,error){
    const options = isObj(success)? success : typeof success =='function'? {success} : {};
    options.success = isFunction(success)? success : options.success;
    options.error = isFunction(error)? error : options.error;
    options.dbName = dbName;
    return getDB(options);
}