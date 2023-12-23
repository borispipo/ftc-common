
import  PouchDB from "pouchdb";
import sqlPouch from "./sqlitePouch";
import initElectron from "./init-electron";
export default   {
    PouchDB,
    ...initElectron({PouchDB,sqlPouch}),
}