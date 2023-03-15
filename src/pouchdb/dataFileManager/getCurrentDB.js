// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import {getSessionData} from "$cauth/utils/session";
import localSession from "$session";
import {isFunction,isNonNullString} from "$cutils";

export default function getCurrentDB(success,error){
    const cDB = getSessionData("currentDB");
    let dbName = defaultStr(localSession.get("currentDB"),cDB)
    if(isNonNullString(dbName)) {
        if(isFunction(success)){
            success(dbName);
        }
    } else if(isFunction(error)){
        error();
    }
    return dbName;
}

