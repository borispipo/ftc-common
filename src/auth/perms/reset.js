export const tableDataPerms = {};
export const structDataPerms = {};
////pointe vers l'ensemble des tables data de l'application
import tablesObj from"$pouchdbTableData";
///pointe vers l'ensemble des struct data de l'application
import  structData from"$pouchdbStructData";


export const resetPerms = ()=>{
    const allPerms = {};
    Object.map(tableDataPerms,(v,i)=>{
        delete tableDataPerms[i];
    })
    Object.map(structDataPerms,(v,i)=>{
        delete structDataPerms[i];
    })
    const action = ['read','create','write','update','edit','delete','remove']
    Object.map(tablesObj,(table,tableName,c1)=>{
        tableName = tableName.toLowerCase().trim();
        let resource = "table/"+tableName.ltrim("table/");
        tableDataPerms[tableName] = Auth.isAllowed({resource,action});
    })
    Object.map(structData,(table,tableName,c1)=>{
        tableName = tableName.toLowerCase().trim();
        let resource = "structdata/"+tableName.ltrim("structdata/");
        structDataPerms[tableName] = Auth.isAllowed({resource,action});
    })
    allPerms.tableDataPerms = tableDataPerms;
    allPerms.structDataPerms = structDataPerms;
    return allPerms;
}
