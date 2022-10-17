// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {handleGetValue,handleSetValue} from "./utils";
import {isElectron} from "$cplatform";
import web from "./web/storage";
let get = web.get, set = web.set;
if(isElectron() && window.ELECTRON && typeof ELECTRON.SESSION=="object" && ELECTRON.SESSION){
    if(typeof ELECTRON.SESSION.set =='function'){
        set = (key,value,decycle)=>{
            return Promise.resolve(ELECTRON.SESSION.set(key,handleSetValue(value,decycle)));
        }
    }
    if(typeof ELECTRON.SESSION.get =="function"){
        get = key => handleGetValue(ELECTRON.get(key));
    }
}

export default {get,set};

export {get,set};