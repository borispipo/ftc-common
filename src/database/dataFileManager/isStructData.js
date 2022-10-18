// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.


export default function isStructData (dFCode){
    if(isObj(dFCode)){
        dFCode = dFCode.code;
    }
    return defaultStr(dFCode).toLowerCase().trim() === structDataDBName.toLowerCase().trim();
}