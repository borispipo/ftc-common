// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {isObj,isNonNullString} from "$cutils";
import APP from "$capp/instance";
import fetch from "./fetch";
import getDB  from "./getDB";
import getPouchDB from "$pouchdb/getDB/getDB";

const hasHandleRemove = {current:false};

const remove = (dF)=>{
    const code = isObj(dF) && isNonNullString(dF.code)? dF.code : isNonNullString(dF)? dF : undefined;
    if(!isNonNullString(code)){
        return Promise.reject({message:'Impossible de supprimer le fichier de données spécifié car son code est manquant ou null'})
    }
    return getDB().then(({db:finalDB})=>{
        return finalDB.get(code).then((dFN)=>{
            return getPouchDB({...dFN,dbName:dFN.code,dataFileType:dFN.type}).then(({db})=>{
                return db.destroy().then(()=> {
                    finalDB.remove(code).then((c)=>{
                        fetch().catch(x=>x).finally(e=>{
                            APP.trigger(APP.EVENTS.REMOVE_POUCHDB_DATA_FILE,db?.infos);
                        });
                        return c;
                    });
                })
            })
        })
    })

};

if(!hasHandleRemove.current){
    hasHandleRemove.current = true;
    APP.on(APP.EVENTS.REMOVE_POUCHDB_DATABASE,(dbName)=>{
        remove(dbName).then(fetch);
    });
}

export default remove;