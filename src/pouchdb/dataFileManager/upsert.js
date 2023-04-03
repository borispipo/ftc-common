// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import isValid from "./isValidDataFile";
import getDB from "./getDB";
import fetch from "./fetch";
import APP from "$capp/instance";

const upsert = (dF,diffFunc)=>{
    if(!isValid(dF)){
        return Promise.reject({message:'Invalid data file, could not insert it ',dataFile : dF});
    }
    return new Promise((resolve,reject)=>{
        return getDB().then(({db})=>{
            return db.upsert(dF.code,(newDoc)=>{
                return {...newDoc,...dF};
            }).then((nD)=>{
                return fetch().finally(()=>{
                    resolve(nD);
                    APP.trigger(APP.EVENTS.UPSERT_POUCHDB_DATA_FILE,nD.newDoc);
                })
            });
        }).catch(reject);
    })
};

export default upsert;

