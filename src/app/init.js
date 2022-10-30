// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import APP from "./instance";
import init from "$active-platform/init";
import {isPromise} from "$cutils";

export default function initApp(options){
    options = defaultObj(options);
    APP.checkOnline();
    if(typeof init =='function'){
        const r = init();
        if(isPromise(r)){
            return r;
        }
    }
    return Promise.resolve({})
}