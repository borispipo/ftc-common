// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

if(typeof window != "undefined" && window){
    if(!window.URL || !window.URLSearchParams){
        const polyfill = require('react-native-url-polyfill');
        Object.defineProperties(window,{
            URL : {
                value : polyfill.URL,
            },
            URLSearchParams : {
                value : polyfill.URLSearchParams,
            }
        })
    }
}