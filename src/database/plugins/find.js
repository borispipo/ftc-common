import findPlugin from "pouchdb-find";
let {find} = findPlugin;
import pouchdbFindProps from "./pouchdbFindProps";
export default extendObj({},findPlugin,{
    find : function(opts){
        opts = defaultObj(opts);
        for(let i in opts){
            if(!arrayValueExists(pouchdbFindProps,i)) delete opts[i];
        }
        return find.call(this,opts);
    }
});