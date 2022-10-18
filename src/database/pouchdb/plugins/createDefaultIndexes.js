// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {isCommon as isCommonDataFile,isStructData,sanitizeName} from "$cdatabase/dataFileManager/utils";
import DATABASES_INDEXES from "$cdatabase/utils/DATABASES_INDEXES";
import indexes from "$databaseIndex";
const getIndexToCreateOrDelete = (idx)=>{
    let r = {};
    if(isArray(idx)){
        idx.map((index)=>{
            if(isObj(index) && isNonNullString(index.name) && (isObj(index.views) || isArray(index.fields))){
                r[index.name] = index;
            }
        })
    } else {
        if(isObj(idx) && isNonNullString(idx.name) && ( isObj(idx.views) || isArray(idx.fields))){
            r[idx.name] = idx;
        }
    }
    return r;
}

const createIndex = (db,idx,dbName)=>{
    let promises = [];
    const DB_INDEXES = DATABASES_INDEXES.get();
    let indexToCreate = getIndexToCreateOrDelete(idx);
    for(let name in indexToCreate){
        let index = indexToCreate[name];
        if(isObj(index.views)){
            let views = {}, hasViews = false,viewFuncs = [];
            for(let i in index.views){
                if(isObj(index.views[i]) && isFunction(index.views[i].map,true)){
                    hasViews = true;
                    viewFuncs.push(i);
                    views[i] = {
                        ...index.views[i],
                        map : index.views[i].map.toString()//.replace(/\r?\n|\r/g, "")
                    }
                }
            }
            if(hasViews){
                promises.push(new Promise((resolve,reject)=>{
                    let success = (r)=>{
                        if(!DB_INDEXES[dbName]){
                            viewFuncs.map(v=>{
                                db.queryMapReduce({designId:name+"/"+v,key:uniqid("query-key-refresh-view-"+v)});
                            })
                        }
                        resolve(r);
                        return r;
                    }
                    db.put({_id:'_design/'+name,views}).then(success).catch(e=>{
                        if(e && e.status !==409){
                            reject(e);
                        } else {
                            success({stauts:true,msg:"Cette vue existe déjà en base de données",views,_id:'_design/'+name})
                        }
                    })
                }))
            }
        } else if(isArray(index.fields)){
            promises.push(db.createIndex({index:{...indexToCreate[name],ddoc:name,name}}))
        }
    }
    return Promise.all(promises).then((r)=>{
        DB_INDEXES[dbName] = true;
        return r;
    }).catch((e)=>{
        delete DB_INDEXES[dbName];
        console.log(e," creating index of ",dbName,indexToCreate,idx)
    });;
}

export default function createDefaultPouchDBIndexes(force,rest){
    let context = this;
    rest = isBool(rest)? {reset:rest} : defaultObj(rest);
    let {reset,views}  = rest;
    if(!isObj(context) || !isFunction(context.createIndex) || !isNonNullString(this.realName)){
        return Promise.resolve(context);
    }
    if(reset === true || views === true){
        force = true;
    }
    const DB_INDEXES = DATABASES_INDEXES.get();
    let dbName = sanitizeName(this.realName);///les indices sont stockés dans les nom de base de données en majuscule
    if(force !== true && DB_INDEXES[dbName]){
        return Promise.resolve(context);
    }
    if(isStructData(dbName)){
        return Promise.resolve(context);
    }
    let isCommon = isCommonDataFile(dbName);
    let idx = isObj(indexes[dbName])? indexes[dbName] : isCommon? indexes.common_db : indexes.default;
    if(reset === true || views === true){
        return context.getIndexes().then(({indexes})=>{
            let eIndexes = getIndexToCreateOrDelete(idx);
            let promises = [];
            if(views !== true){
                Object.map(indexes,(idx)=>{
                    if(isObj(idx) && isNonNullString(idx.ddoc)){
                        if(eIndexes[idx.ddoc.ltrim("_design/").trim()]){
                            promises.push(context.deleteIndex(idx))
                        }
                    }
                })
            }
            for(let i in eIndexes){
                if(isObj(eIndexes[i].views)){
                    promises.push(
                        context.get("_design/"+defaultStr(eIndexes[i].name,i)).then((d)=>{
                            //console.log(d," is ressetting view index",eIndexes[i].name)
                            return context.remove(d,true).then((r)=>{
                                return context.viewCleanup();
                            });
                        })
                    )
                }
            }
            return Promise.all(promises).catch((e)=>{
                delete DB_INDEXES[dbName];
                return e;
            });
        }).finally(x=>{
            return createIndex(context,idx,dbName);
        })
    }
    return createIndex(context,idx,dbName);
}
