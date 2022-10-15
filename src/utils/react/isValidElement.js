// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import * as ReactIs from "react-is";
export default function isValidElementCustom(element,includeStrOrText){
    if(ReactIs.isElement(element)) return true;
    if(includeStrOrText && (typeof element =="string" || typeof element =="number" || typeof element =='boolean')){
        return true;
    }
    if (Array.isArray(element)) {
        if(element.length == 0) return true;
        let isV = element.reduce((acc, e) => acc && isValidElementCustom(e,includeStrOrText), true);
        if(isV) return true;
    }
    return false;
}