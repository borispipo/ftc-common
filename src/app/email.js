// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {isElectron} from "$cplatform";
import {isObj} from "$cutils";

export const canSendMail = ()=>{
    if(!isElectron() || !isObj(ELECTRON.EMAIL)) return false;
    return ELECTRON.EMAIL.isAvailable(); 
}