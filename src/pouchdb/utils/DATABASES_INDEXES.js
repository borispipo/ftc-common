// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

let __DB_INDEXES = {};

export const get = () =>{
    return __DB_INDEXES;
}

export const set = (databases) =>{
    if(typeof databases =='object' && databases){
        __DB_INDEXES = databases;
    }
    return __DB_INDEXES;
}

export default {
    get,set
};