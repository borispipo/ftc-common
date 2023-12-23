
import  PouchDB from "pouchdb";
import sqlPouch from "./sqlitePouch";
export default   {
    PouchDB,
    ...require("./init-electron")({PouchDB,sqlPouch}),
}