// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

const queryMapReduce = function(designId,options){
    let db = this;
    if(isObj(designId)){
        options = extendObj({},designId,options);
    } else if(isNonNullString(designId)){
        options.designId = defaultStr(options.designId,designId);
    }
    options = defaultObj(options);
    let handleResult = defaultVal(options.handleResult,options.returnArray,true);
    designId = defaultStr(options.designId,options.designName,options.design);
    if(!designId){
        return handleResult? Promise.resolve([]) : {docs:[],total_rows:0};
    }
    let {filter,table,reference,type,mutator,design,designName,...rest} = options;
    filter = defaultFunc(filter,({doc})=>doc);
    mutator = defaultFunc(mutator,({doc})=>doc);
    rest.include_docs = defaultBool(rest.include_docs,true);
    rest.reduce = defaultVal(rest.reduce,false);
    return db.query(designId,rest).then((result)=>{
        if(handleResult){
            let {rows} = result;
            let docs = [];
            rows.map((doc)=>{
                if(/^_design\//.test(doc.id) || doc._deleted)return null;
                let arg = {doc:defaultObj(doc.doc),value:doc.value,key:doc.key,_id:doc.id,id:doc.id};
                if(filter(arg)){
                    let mDoc = mutator(arg);
                    if(isObj(mDoc)){
                        docs.push(mDoc);
                    }
                }
            })
            return docs;
        }
        return result;
    })
}
export default {
    queryMapReduce,
    queryMapReduceWithRef : function(opts){
        opts = defaultObj(opts);
        opts.designId = defaultStr(opts.designId,"reference/ref_table_type");
        let {table,type,reference} = opts;
        let key = [];
        table = defaultStr(table).toUpperCase();
        reference = defaultStr(reference).toUpperCase();
        if(!(table) || !(reference)){
            console.log(" table non définie ",table," ou référence non définie ",reference," pour la requête sur la vue référence en base de données ",this.getName(),opts)
        } else {
            if(isArray(type)){
                type.map((t)=>{
                    if(isNonNullString(t)){
                        key.push(APP.buildMapReduceQueryKey(reference,table,t.toUpperCase()))
                    }
                })
            } else if(isNonNullString(type)){
                key.push(APP.buildMapReduceQueryKey(reference,table,type.toUpperCase()))
            }
        }
        if(key.length == 1){
            opts.key = key[0];
            delete opts.keys;
        } else {
            opts.keys = key;
            delete opts.key;
        }
        return queryMapReduce.call(this,opts);
    }
}