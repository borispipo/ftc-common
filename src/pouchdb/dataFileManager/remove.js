// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import _upsert from "./upsert";
import {isObj,isNonNullString} from "$cutils";
import APP from "$app/instance";
import fetch from "./fetch";

export const remove = (dF)=>{
    let code = isObj(dF) && isNonNullString(dF.code)? dF.code : isNonNullString(dF)? dF : undefined;
    return _upsert((dataFiles)=>{
        if(isNonNullString(code)){
            delete dataFiles[code.toLowerCase().trim()];
        }
        return dataFiles;
    });
};

if(!APP.hasHandleRemoveEvents){
    APP.hasHandleRemoveEvents = true;
    APP.on(APP.EVENTS.REMOVE_DATABASE,(dbName)=>{
        remove(dbName).then(fetch);
    });
}