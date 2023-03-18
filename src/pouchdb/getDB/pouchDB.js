import "../polyfill";
import PouchObj from "../pouchdb";
import uniqid from "../pouchdb/plugins/uniqid";
import createDefaultIndexes from "../pouchdb/plugins/createDefaultIndexes";
import getRealName from "../pouchdb/plugins/getRealName";
import toJSON from "../pouchdb/plugins/toJSON";
import canOverrideRemove from "../pouchdb/plugins/canOverrideRemove";

const {PouchDB,...pouchdbRest} = PouchObj;    

if(typeof window !== 'undefined' && !window.PouchDB){
    Object.defineProperties(window,{
        PouchDB : {value:PouchDB,override:false,writable:false}
    })
}

import QMapReduce from "../pouchdb/plugins/queryMapReduce";
import PouchDBFind from "../pouchdb/plugins/find";
PouchDB.plugin(PouchDBFind);
PouchDB.plugin(require('pouchdb-authentication'));
PouchDB.plugin(require('pouchdb-erase'));
PouchDB.plugin(canOverrideRemove);
PouchDB.plugin(QMapReduce);
PouchDB.plugin({
    uniqid,
    createDefaultIndexes,
    getRealName,
    toJSON,
});

export default {PouchDB,...pouchdbRest};

export {PouchDB};