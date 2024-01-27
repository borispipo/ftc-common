// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import isCommonDataFile from "../../dataFileManager/isCommon";
import sanitizeName from "../../dataFileManager/sanitizeName";
import isStructData from "../../dataFileManager/isStructData";
import pouchdbIndexes from "../../utils/pouchdbIndexes";
import {isNonNullString,isBool,isObjOrArray,isObj,defaultObj,extendObj,defaultStr} from "$cutils";
import types from "../../dataFileManager/types";

const getIndexToCreateOrDelete = (idx)=>{
    let r = {};
    if(Array.isArray(idx)){
        idx.map((index)=>{
            if(isObj(index) && isNonNullString(index.name) && (isObj(index.views) || Array.isArray(index.fields))){
                r[index.name] = index;
            }
        })
    } else {
        if(isObj(idx) && isNonNullString(idx.name) && ( isObj(idx.views) || Array.isArray(idx.fields))){
            r[idx.name] = idx;
        }
    }
    return r;
}

const createIndex = (db,idx,dbName)=>{
    const promises = [];
    const indexToCreate = getIndexToCreateOrDelete(idx);
    for(let name in indexToCreate){
        const index = indexToCreate[name];
        if(isObj(index?.views)){
            const views = {},viewFuncs = [];
            for(let i in index.views){
                if(isObj(index.views[i]) && (typeof index.views[i].map =='function' || isNonNullString(index.views[i].map))){
                    const viewName = defaultStr(index.views[i].name,i);
                    if(typeof index.viewFilter =="function" && index.viewFilter({dbName,indexToCreate,indexes:idx,context:db,db,viewName,name:viewName}) === false) continue; 
                    viewFuncs.push(i);
                    views[i] = {
                        ...index.views[i],
                        map : index.views[i].map.toString()//.replace(/\r?\n|\r/g, "")
                    }
                }
            }
            if(viewFuncs.length){
                promises.push(new Promise((resolve,reject)=>{
                    const success = (r)=>{
                        if(false && !pouchdbIndexes[dbName]){
                            viewFuncs.map(v=>{
                                db.queryMapReduce({designId:name+"/"+v,key:uniqid("query-key-refresh-view-"+v)});
                            });
                        }
                        resolve(r);
                        return r;
                    }
                    db.upsert('_design/'+name,()=>({views})).then(success).catch(e=>{
                        if(e && e.status !==409){
                            reject(e);
                        } else {
                            success({stauts:true,msg:"Cette vue existe déjà en base de données",views,_id:'_design/'+name})
                        }
                    });
                }));
            }
        } else if(Array.isArray(index?.fields)){
            promises.push(db.createIndex({index:{...indexToCreate[name],ddoc:name,name}}))
        }
    }
    return Promise.all(promises).then((r)=>{
        pouchdbIndexes[dbName] = true;
        return r;
    }).catch((e)=>{
        delete pouchdbIndexes[dbName];
        console.log(e," creating index of ",dbName,indexToCreate,idx)
    });;
}

const getContextIndexes = (context)=>{
    if(!context || !isObj(context?.infos) || !isNonNullString(context?.infos?.type) || typeof context?.isCommon !=='function') return [];
    const isCommon = context.isCommon();
    const dfType = types[context.infos?.type];
    const commonType = types.common;
    //les indexs doivent être définis dans le champ indexes du type de dataFile
    return isObjOrArray(dfType?.indexes) ? dfType.indexes : isCommon ? commonType?.indexes : [];
}

export default function createDefaultPouchDBIndexes(force,rest){
    let context = this;
    if(context?.infos?.isDataFileManager){
        return Promise.resolve(context);
    }
    rest = isBool(rest)? {reset:rest} : defaultObj(rest);
    let {reset,views}  = rest;
    if(!isObj(context) || !isFunction(context.createIndex) || !isNonNullString(this.realName)){
        return Promise.resolve(context);
    }
    if(reset === true || views === true){
        force = true;
    }
    const dbName = sanitizeName(defaultStr(this.infos?.name,this.getName()));///les indices sont stockés dans les nom de base de données en majuscule
    if(force !== true && pouchdbIndexes[dbName]){
        return Promise.resolve(context);
    }
    if(isStructData(dbName)){
        return Promise.resolve(context);
    }
    const idx =  getContextIndexes(context);
    ///on peut créer les index en fonction du type
    if(reset === true || views === true){
        return context.getIndexes().then(({indexes})=>{
            const eIndexes = getIndexToCreateOrDelete(idx);
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
                            return context.remove(d,true).then((r)=>{
                                return context.viewCleanup();
                            });
                        })
                    )
                }
            }
            return Promise.all(promises).catch((e)=>{
                delete pouchdbIndexes[dbName];
                return e;
            });
        }).finally(x=>{
            return createIndex(context,idx,dbName);
        })
    }
    return createIndex(context,idx,dbName);
}

export function resetViewsIndexes(opts){
    opts = isObj(opts)? opts : typeof opts ==='boolean'? {force:opts} : {};
    const {force} = opts;
    return createDefaultPouchDBIndexes.call(this,force,extendObj(true,{},opts,{views:true}));
}

export function hasDesignView (viewName){
    if(!isNonNullString(viewName)) return false;
    const idx = getContextIndexes(this);
    if(Array.isArray(idx)){
        for(let i in idx){
            const index = idx[i];
            if(isObj(index) && isNonNullString(index.name)){
                if((Array.isArray(index.fields)) && index.name === viewName){
                    return true;
                }
                if(isObj(index.views)){
                    for(let j in index.views){
                        const key = `${index.name}/${j}`;
                        const view = index.views[j];
                        if(key === viewName && isObj(view) && ["string","function"].includes(typeof view.map)) return true;
                    }
                }
            }
        }
        return false;
    } else  if(isObj(idx) && isNonNullString(idx.name)){
        if((Array.isArray(idx.fields)) && idx.name === viewName){
            return true;
        }
        if(isObj(isObj(idx.views))){
            for(let j in idx.views){
                const key = `${idx.name}/${j}`;
                const view = idx.views[j];
                if(key === viewName && isObj(view) && ["string","function"].includes(typeof view.map)) return true;
            }
        }
    }
    return false;
}