// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {defaultFunc,isNonNullString,defaultBool,defaultStr,defaultVal} from "$cutils";

/*** permet de faire une requête couchdb|poucdb sur la vue dont les options sont passés en paramètre
 * @param {string} designId, l'id du design
 * @param {object}, options, les options supplémentaires de la forme : 
 * {
 *      handleResult {boolean}, si les données seront interprétées, parcourues
 *      mutator : {function}, la fonction de mutation qui sera appliquée sur les données au cas où handleResult est à true
 *      ...rest {object} le reste d'options à passer à la fonction pouchdb query
 * }
 */
export const queryMapReduce = function(designId,options){
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
                let arg = {doc:defaultObj(doc.doc),data:defaultObj(doc.doc),value:doc.value,key:doc.key,_id:doc.id,id:doc.id};
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
export default queryMapReduce;