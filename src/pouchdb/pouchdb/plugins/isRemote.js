const pouchdbUtils = require('pouchdb-utils');
export default function isPouchdbRemote(){
    return pouchdbUtils.isRemote(this);
}