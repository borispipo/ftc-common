import appConfig from "$capp/config";
import {isObj,defaultStr} from "$cutils";

export const tableDataPerms = {};
export const structDataPerms = {};

/*** 
 *  - on peut définir la liste des noms de tables data dans le propriété tables|tableNames de appConfig.tablesData
 *  - on peut définir la liste des noms struct data dans la propriété structData | structDataTableNames de appConfig.structsData
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
    Object.map(appConfig.tablesData,(table,tableName)=>{
        tableName = defaultStr(isObj(table) && (table.tableName || table.table),tableName)
        if(!(tableName)) return null;
        tableName = tableName.toLowerCase().trim();
        let resource = "table/"+tableName.ltrim("table/");
        tableDataPerms[tableName] = Auth.isAllowed({resource,action});
    })
    Object.map(appConfig.structsData,(table,tableName)=>{
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

export const disableAuth = ()=>{
    appConfig.set("isAuthSingleUserAllowed",true);
    appConfig.set("authDefaultUser",{code:"root",password:"admin123",label:"Master admin"});
    resetPerms();
    return true;
  }
  
  export const enableAuth = ()=>{
    appConfig.set("isAuthSingleUserAllowed",false);
    appConfig.set("authDefaultUser",null);
    resetPerms();
    return true;
  }