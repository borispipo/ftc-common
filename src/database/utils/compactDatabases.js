// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {isNativeDesktop} from "$cplatform";
import POUCH_DATABASES  from "./pouchdbDatabases";
export const compactDB = (db,force) =>{
    if(!force && !isNativeDesktop()) return Promise.resolve();
    window.__allCompactingDBS = defaultObj(window.__allCompactingDBS);
    let dbN = db.getName()+(db.isRemoteServer?"-true":"-false");
    if(!window.__allCompactingDBS[dbN]){
        window.__allCompactingDBS[dbN] = true;
        return db.compact().catch((e)=>e).finally(x=>{
            delete window.__allCompactingDBS[dbN];
            return x;
        });
    }
    return Promise.resolve(true);
}

export default function compactDatabases(databases){
    const dbs = [];
    databases = typeof (databases) =='object' && databases? databases : POUCH_DATABASES.get()
    Object.map(databases,(db)=>{
        if(db && db.info){
            dbs.push(db.info().then(x=>APP.compactDB(db,true)))
        }
    });
    return Promise.all(dbs).finally(x=> {
        //gc(true);
        return x;
    });
}