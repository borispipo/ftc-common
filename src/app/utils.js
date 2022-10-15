// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import APP from "./instance";

let ___isInitialized = false;

export const setIsInitialized = b =>{
    if(typeof b =='boolean'){
        ___isInitialized = b;
        APP.trigger(APP.EVENTS.IS_INITIALIZED,b);
    }
}

export const isInitialized = x=> ___isInitialized;
