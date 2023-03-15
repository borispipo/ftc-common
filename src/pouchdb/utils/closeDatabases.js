// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import "$cutils";
import POUCH_DATABASES  from "./pouchdbDatabases";
import pouchdbIndexes from "./pouchdbIndexes";

const closeDatabases = (databases) =>{
    const promises = [];
    let dbs = typeof (databases) ==='object' && databases ? databases : POUCH_DATABASES.get();
    const DB_INDEXES = pouchdbIndexes.get();
    Object.map(dbs,(db,index)=>{
        if(isObj(db) && isFunction(db.close)){
            if(isNonNullString(db.realName)){
                delete DB_INDEXES[db.realName]
            }
            promises.push(db.close().then((r)=>{
                delete dbs[index];
                return r;
            }))
        }
    });
    return Promise.all(promises).catch((e)=>{
        console.log("closing all databases",e);
    });
}

export default closeDatabases;