// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

export default function isDOMElement(o){
    if(typeof window !="object" || !window || typeof document =='undefined' || typeof HTMLElement =="undefined") return false;
    if(o === document) return true;
    //if(o === window) return true;
    if ("HTMLElement" in window) return (!!o && o instanceof HTMLElement);
    return (!!o && typeof o === "object" && o.nodeType === 1 && !!o.nodeName);
}