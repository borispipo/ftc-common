// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

///used to set indexes of pouchdb database
const indexRef = {current:{}};

export const get = () =>{
    return indexRef.current;
}

export const set = (databases) =>{
    if(typeof databases =='object' && databases){
        indexRef.current = databases;
    }
    return indexRef.current;
}

export default {
    get,set
};