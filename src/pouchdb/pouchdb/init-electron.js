import {isElectron} from "$cplatform";

export default function ({PouchDB,sqlPouch}){
    if(isElectron() && typeof ELECTRON !=='undefined' && ELECTRON && typeof ELECTRON?.openPouchDBDatabase =='function' ){
        window.sqlitePlugin = {openDatabase:ELECTRON.openPouchDBDatabase};
        PouchDB.plugin(function (PouchDB) {
            PouchDB.adapter('node-sqlite', sqlPouch(), true)
        });
        return {adapter:"node-sqlite"};
    }
    return {};
}