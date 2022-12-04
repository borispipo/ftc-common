export const tableDataPerms = {};
export const structDataPerms = {};
////pointe vers l'ensemble des tables data de l'application
import tablesObj from"$pouchdbTableData";
///pointe vers l'ensemble des struct data de l'application
import  structData from"$pouchdbStructData";
import authSignIn2Signout from "../$authSignIn2SignOut";

/*** 
 *  - on peut définir la liste des noms de tables data dans le propriété tables|tableNames de auhSignIn2Signout
 *  - on peut définir la liste des noms struct data dans la propriété structData | structDataTableNames de authSignIn2Signout
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
    Object.map(defaultObj(authSignIn2Signout.tables,authSignIn2Signout.tableNames,tablesObj),(table,tableName,c1)=>{
        if(!isNonNullString(tableName)) return null;
        tableName = tableName.toLowerCase().trim();
        let resource = "table/"+tableName.ltrim("table/");
        tableDataPerms[tableName] = Auth.isAllowed({resource,action});
    })
    Object.map(defaultObj(authSignIn2Signout.structData,authSignIn2Signout.structDataTableNames,structData),(table,tableName,c1)=>{
        if(!isNonNullString(tableName)) return null;
        tableName = tableName.toLowerCase().trim();
        let resource = "structdata/"+tableName.ltrim("structdata/");
        structDataPerms[tableName] = Auth.isAllowed({resource,action});
    })
    allPerms.tableDataPerms = tableDataPerms;
    allPerms.structDataPerms = structDataPerms;
    return allPerms;
}
