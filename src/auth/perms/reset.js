import appConfig from "$capp/config";
import {isObj,defaultStr,isNonNullString} from "$cutils";
import authSignIn2SignOut from "../authSignIn2SignOut";
export const tableDataPerms = {};
export const structDataPerms = {};

export const getTableDataPermResourcePrefix = (tableName,...rest)=>{
    return authSignIn2SignOut.tableDataPermResourcePrefix(defaultStr(tableName).trim().ltrim("/"),...rest);
}

export const getStructDataPermResourcePrefix = (tableName,...rest)=>{
    return authSignIn2SignOut.structDataPermResourcePrefix(defaultStr(tableName).trim().ltrim("/"),...rest);
}
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
        const resource = getTableDataPermResourcePrefix(tableName.toLowerCase().trim()).trim().rtrim("/");
        tableDataPerms[tableName] = Auth.isAllowed({resource,action});
    })
    Object.map(appConfig.structsData,(table,tableName)=>{
        tableName = defaultStr(isObj(table) && (table.tableName || table.table),tableName)
        if(!(tableName)) return null;
        const resource = getStructDataPermResourcePrefix(tableName.toLowerCase().trim()).trim().rtrim("/");
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