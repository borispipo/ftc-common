// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

const hasDocument = x => typeof document !== 'undefined' && document ? true : false;
export default {
    set : (key,value,cb) =>{
        if(!hasDocument()) return;
        document.cookie = key + '=' + value;
        if(typeof cb =='function'){
            cb();
        }
        return value;
    },
    get : (key,cb) =>{
        if(!hasDocument()) return;
        let v = document.cookie ? document.cookie : '';
        if(typeof cb =='function'){
            cb(v);
        }
        return v;
    }
}