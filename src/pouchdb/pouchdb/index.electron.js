
import  PouchDB from "pouchdb";
import sqlPouch from "./sqlitePouch";
export default   {
    PouchDB,
    ...ELECTRON.getPouchdb({PouchDB,sqlPouch}),
}