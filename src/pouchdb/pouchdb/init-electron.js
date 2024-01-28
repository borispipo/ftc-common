import {isElectron} from "$cplatform";
import {electronAdapter as adapter} from "./utils";

export default function ({PouchDB,sqlPouch}){
    if(false && typeof window !=='undefined' && window && isElectron() && typeof ELECTRON !=='undefined' && ELECTRON && typeof ELECTRON?.openPouchDBDatabase =='function' ){
        const SQLitePouch = sqlPouch(function(...args){
            return ELECTRON.openPouchDBDatabase(...args);
        },"use-callbck");
        SQLitePouch.adapter = adapter;
        function customQSitePouchAdapter (PouchDB) {
            PouchDB.adapter(adapter, SQLitePouch, true)
        }
        customQSitePouchAdapter.adapter = adapter;
        PouchDB.plugin(customQSitePouchAdapter);
        return {adapter};
    }
    return {};
}