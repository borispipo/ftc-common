// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import isCommonDataFile from "../../dataFileManager/isCommon";
import sanitizeName from "../../dataFileManager/sanitizeName";
import isStructData from "../../dataFileManager/isStructData";
import pouchdbIndexes from "../../utils/pouchdbIndexes";
import {isNonNullString,isBool,isObjOrArray,isObj,defaultObj,extendObj} from "$cutils";
import types from "../../dataFileManager/types";

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
    const promises = [];
    const indexToCreate = getIndexToCreateOrDelete(idx);
    for(let name in indexToCreate){
        const index = indexToCreate[name];
        if(isObj(index?.views)){
            const views = {},viewFuncs = [];
            for(let i in index.views){
                if(isObj(index.views[i]) && (typeof index.views[i].map =='function' || isNonNullString(index.views[i].map))){
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
                        if(!pouchdbIndexes[dbName]){
                            viewFuncs.map(v=>{
                                db.queryMapReduce({designId:name+"/"+v,key:uniqid("query-key-refresh-view-"+v)});
                            });
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
                }));
            }
        } else if(isArray(index?.fields)){
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

export default function createDefaultPouchDBIndexes(force,rest){
    let context = this;
    if(context?.infos?.isDataFileManager || isCommonDataFile(this?.infos?.name) || isCommonDataFile(this?.getName())){
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
    const isCommon = this.isCommon();
    const dfType = types[context.infos?.type];
    const commonType = types.common;
    //les indexs doivent être définis dans le champ indexes du type de dataFile
    const idx = isObjOrArray(dfType?.indexes) ? dfType.indexes : isCommon ? commonType.indexes : [];
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