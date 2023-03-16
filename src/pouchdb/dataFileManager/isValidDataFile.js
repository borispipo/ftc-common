// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {isObj,isNonNullString,defaultStr} from "$cutils";
import sanitizeName from "./sanitizeName";

export default function isValidDataFile (dF,codeIndex){
    if(isObj(dF) && isNonNullString(dF.code) && isNonNullString(dF.type) && isNonNullString(dF.label)){
        dF.code = sanitizeName(dF.code);
        dF.code = defaultStr(dF.code,codeIndex).toLowerCase().trim();
        return dF;
    }
    return undefined;
}