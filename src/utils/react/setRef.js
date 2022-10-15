// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

/**** associe la référence passée en paramètre à l'objet value
   * @param : {ref} la référence qu'on souhaite associer
   * @param {value} la valeur à associer à la référence
   */
const setRef = (ref,value,cb)=>{
    if(typeof ref =="function"){
        ref(value);
    } else if(ref && "current" in ref){
        ref.current = value;
    }
    if(typeof cb ==='function'){
        cb(value);
    }
    return ref;
}

export default setRef;