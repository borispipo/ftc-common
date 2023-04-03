// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {isObj,isNonNullString} from "$cutils";
import APP from "$app/instance";
import fetch from "./fetch";
import getDB  from "./getDB";

const hasHandleRemove = {current:false};

const remove = (dF)=>{
    const code = isObj(dF) && isNonNullString(dF.code)? dF.code : isNonNullString(dF)? dF : undefined;
    return getDB().then(({db})=>{
        return db.remove(code).then((c)=>{
            fetch().catch(x=>x).finally(e=>{
                APP.trigger(APP.EVENTS.REMOVE_POUCHDB_DATA_FILE,db?.infos);
            });
            return c;
        });
    })
};

if(!hasHandleRemove.current){
    hasHandleRemove.current = true;
    APP.on(APP.EVENTS.REMOVE_POUCHDB_DATABASE,(dbName)=>{
        remove(dbName).then(fetch);
    });
}

export default remove;