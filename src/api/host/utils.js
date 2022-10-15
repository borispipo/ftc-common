// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import defaultStr from "$cutils/defaultStr";

let localhost = undefined;
export const getLocalHost  = x=>{
    if(localhost) return localhost;
    if(typeof window !=='undefined' && window && window.location){
        const port = window.location.port;
        localhost = window.location.protocol + '//' + window.location.hostname+(port?(":"+port):"");
    }
    return localhost;
}

export const getBaseHost = x=>{
    return defaultStr(process.env.API_HOST,getLocalHost());
}

export const API_VERSION = defaultStr(process.env.API_VERSION);

export const API_BASE_PATH = "/api/"+(API_VERSION?(API_VERSION+"/"):'')

export const PROTECTED_API_BASE_PATH = API_BASE_PATH.rtrim("/")+"/protected/";


export const getAPIHost = x=> {
    let host = getBaseHost();
    if(host){
        host = host.rtrim("/")+"/";
        host = host.rtrim(API_BASE_PATH).rtrim("/")+API_BASE_PATH;
        return host;
    }
    return API_BASE_PATH;
}

export const getApiHost = getAPIHost;