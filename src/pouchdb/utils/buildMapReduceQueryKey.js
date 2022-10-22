// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

export default function buildMapReduceQueryKey(){
    let args = Array.prototype.slice.call(arguments,0);
    let separator = "/";
    let ret = "";
    for(let i=0;i<args.length;i++){
        if(isNonNullString(args[i])){
            ret += (ret?separator:"");
            ret+= args[i].trim().ltrim(ret);
        }
    }
    return ret.trim();
}