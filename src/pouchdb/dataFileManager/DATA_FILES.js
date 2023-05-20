// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
/*** used to cache datafiles in database */
import {isObj} from "$cutils";

const dataFiles = {current:{}};

export const get = () => {
    return isObj(dataFiles.current) && dataFiles.current || {};
};

export const set = (dFiles) =>{
    if(isObj(dFiles)){
        dataFiles.current = dFiles;
    }
};

export default {get,set};