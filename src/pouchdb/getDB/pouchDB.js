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

import queryMapReduce from "../pouchdb/plugins/queryMapReduce";
import PouchDBFind from "../pouchdb/plugins/find";
import isRemote from "../pouchdb/plugins/isRemote";
import isCommon from "../dataFileManager/isCommon";
PouchDB.plugin(PouchDBFind);
PouchDB.plugin(require('pouchdb-authentication'));
PouchDB.plugin(require('pouchdb-erase'));
PouchDB.plugin(canOverrideRemove);
PouchDB.plugin({queryMapReduce});
PouchDB.plugin({
    uniqid,
    isRemote,
    isCommon,
    createDefaultIndexes,
    getRealName,
    toJSON,
});

export default {PouchDB,...pouchdbRest};

export {PouchDB};