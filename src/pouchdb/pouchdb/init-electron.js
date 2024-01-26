import {isElectron} from "$cplatform";

export default function ({PouchDB,sqlPouch}){
    if(isElectron() && typeof ELECTRON !=='undefined' && ELECTRON && typeof ELECTRON?.openPouchDBDatabase =='function' ){
        const adapter = "electron-node-sqlite";
        window.sqlitePlugin = {openDatabase:ELECTRON.openPouchDBDatabase,sqlitePluginAdater:adapter};
        const electronPouchdbSQLite = function (PouchDB) {
            PouchDB.adapter(adapter, sqlPouch(), true)
        };
        electronPouchdbSQLite.adapter = adapter;
        PouchDB.plugin(electronPouchdbSQLite);
        return {adapter};
    }
    return {};
}