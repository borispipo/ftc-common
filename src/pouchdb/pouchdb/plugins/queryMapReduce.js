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
export const queryMapReduce = function(designId,_options){
    const db = this;
    const {limit,skip,page,withTotal,...options} = defaultObj(_options);
    if(typeof limit =='number' && limit){
        options.limit = Math.ceil(limit);
    }
    if(typeof skip =='number' && skip){
        options.skip = Math.ceil(skip);
    } else if(typeof page =='number' && Math.ceil(page)>0 && options.limit){
        options.skip = Math.ceil(page)*options.page;
    }
    if(isObj(designId)){
        options = extendObj({},designId,options);
    } else if(isNonNullString(designId)){
        options.designId = defaultStr(options.designId,designId);
    }
    let handleResult = defaultVal(options.handleResult,options.returnArray,true);
    designId = defaultStr(options.designId,options.designName,options.design);
    if(!designId){
        return handleResult? Promise.resolve([]) : {docs:[],total_rows:0};
    }
    const hasView = db.hasDesignView(designId);
    if(!hasView){
        return Promise.reject({message:`Impossible de faire la requête sur la vue ${designId} car celle-ci n'est pas définie comme une vue valide de la base de donnée ${db.realName}`})
    }
    let {filter,table,reference,type,mutator,design,designName,...rest} = options;
    filter = defaultFunc(filter,({doc})=>doc);
    mutator = defaultFunc(mutator,({doc})=>doc);
    const include_docs = rest.include_docs = defaultBool(rest.include_docs,true);
    rest.reduce = defaultVal(rest.reduce,false);
    return new Promise((resolve,reject)=>{
        const handleFinalResult = (result)=>{
            const cb = (result)=>{
                if(withTotal){
                    return db.query(designId,{
                        ...rest,
                        limit : undefined,
                        skip : undefined,
                        handleResult : false,
                        include_docs : false,
                    }).then(({total_rows,...rest})=>{
                        total_rows = Math.max(total_rows-1,0);
                        return resolve({data:result,total_rows,total:total_rows})
                    }).catch(reject);
                } else {
                    resolve(result);
                }
            }
            if(handleResult){
                const {rows} = result;
                const docs = [];
                rows.map((doc)=>{
                    if(/^_design\//.test(doc.id) || doc._deleted)return null;
                    const row = include_docs ? defaultObj(doc.doc) : doc;
                    const arg = {doc:row,data:row,rowData:row,value:doc.value,key:doc.key,_id:doc.id,id:doc.id};
                    if(filter(arg)){
                        const mDoc = mutator(arg);
                        if(isObj(mDoc)){
                            docs.push(mDoc);
                        }
                    }
                });
                cb(docs);
                return docs;
            }
            cb(result);
            return result;
        }
        return db.query(designId,rest).then(handleFinalResult).catch((e)=>{
            if( e?.status == 404 && hasView){
                const docId = defaultStr(e?.docId).toLowerCase().trim();
                const d = designId?.toLocaleLowerCase().trim();
                if(d.startsWith(docId) || docId.startsWith("_design/")){
                    return db.createDefaultIndexes().then((i)=>{
                        return db.query(designId,rest).then(handleFinalResult).catch(reject);
                    }).catch((e)=>{
                        console.log(e,"trying to recreate index for query map reduce",docId,designId,options)
                        reject(e);
                    });
                }       
            }
            reject(e);
        });
    })
}
export default queryMapReduce;