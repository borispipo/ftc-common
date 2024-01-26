import isDocUpdate from "./isDocUpdate";
import { sanitizeTableName } from "./table";
import {defaultStr} from "$cutils";

export {default as POUCH_DATABASES} from "./pouchdbDatabases";
export {default as parseDBName} from './parseDBName';
export {default as getDBName} from "./getDBName";
export {default as getDBNamePrefix} from "./getDBNamePrefix";

export * from "./table";
export {isDocUpdate};

export {default as sanitizeDBName} from "./sanitizeDBName";

/**** la liste des tables et bases de données montées dans un composant react*/
export const MOUNTED_DATABASES_TABLES = {}

/*** mounte la table de données dont la base est passée en paramètre 
 * @param tableName {string}
 * @param dbName {string}
*/
export const mountDatabaseTable = (tableName,dbName)=>{
    const tb = sanitizeTableName(tableName);
    dbName = sanitizeDBName(dbName);
    if(tb && dbName){
        MOUNTED_DATABASES_TABLES[tb] = dbName;
        return true;
    }
    return false;
}

export const unmountDatabaseTable = (tableName)=>{
    tableName = sanitizeTableName(tableName);
    if((tableName)){
        delete MOUNTED_DATABASES_TABLES[tableName];
        return true;
    }
    return false;
}