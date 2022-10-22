// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import commonDataFiles from "./commonDataFiles";
import {isObj,isNonNullString,defaultStr} from "$cutils";
import sanitizeName from "./sanitizeName";

export default function isValidDataFile (dF,codeIndex){
    if(isObj(dF) && isNonNullString(dF.code)){
        dF.code = sanitizeName(dF.code);
        if(dF.code !== 'projects' && commonDataFiles[dF.code]){
            dF.type = 'common';
        }
        dF.type = defaultStr(dF.type,'seller');
        dF.code = defaultStr(dF.code,codeIndex).toLowerCase().trim();
        return dF;
    }
    return undefined;
}