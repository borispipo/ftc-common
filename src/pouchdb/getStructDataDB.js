import {defaultObj} from "$cutils";
import {getDB} from "./getDB";

export const dbName = "struct_data";//le nom de la base de données pour les struct-data;

export default function getStructDataDB (options){
    options = defaultObj(options)
    options.dbName = options.name = dbName;
    return getDB(options);
}