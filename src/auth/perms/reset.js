import appConfig from "$capp/config";
import {isObj,defaultStr} from "$utils";

export const tableDataPerms = {};
export const structDataPerms = {};

/*** 
 *  - on peut définir la liste des noms de tables data dans le propriété tables|tableNames de appConfig.databaseTablesData
 *  - on peut définir la liste des noms struct data dans la propriété structData | structDataTableNames de appConfig.databaseStructData
 *  
 */

export const resetPerms = ()=>{
    const allPerms = {};
    Object.map(tableDataPerms,(v,i)=>{
        delete tableDataPerms[i];
    })
    Object.map(structDataPerms,(v,i)=>{
        delete structDataPerms[i];
    })
    const action = ['read','create','write','update','edit','delete','remove']
    Object.map(appConfig.databaseTablesData,(table,tableName)=>{
        tableName = defaultStr(isObj(table) && (table.tableName || table.table),tableName)
        if(!(tableName)) return null;
        tableName = tableName.toLowerCase().trim();
        let resource = "table/"+tableName.ltrim("table/");
        tableDataPerms[tableName] = Auth.isAllowed({resource,action});
    })
    Object.map(appConfig.databaseStructsData,(table,tableName)=>{
        tableName = defaultStr(isObj(table) && (table.tableName || table.table),tableName)
        if(!(tableName)) return null;
        tableName = tableName.toLowerCase().trim();
        let resource = "structdata/"+tableName.ltrim("structdata/");
        structDataPerms[tableName] = Auth.isAllowed({resource,action});
    })
    allPerms.tableDataPerms = tableDataPerms;
    allPerms.structDataPerms = structDataPerms;
    return allPerms;
}
