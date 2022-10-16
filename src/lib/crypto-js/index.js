// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import defaultStr from "$cutils/defaultStr";
/**** Encrypt and decrypt with XOR function en base64 string */
import Base64 from "$base64";
/*** crypte le message prase passé en paramètre
 *  @param data {string} le texte à crypter
 *  @parm key {string} la clé à utiliser pour crypter
 */
const encode = function(data,key) {
    if((data) && typeof data =='object'){
        key = defaultStr(data.key)
        data = defaultStr(data.pass,data.password);
    }
    data = xorEncodeDecode(data,key);
    return Base64.encode(data).toString();
};
/*** décrypte le texte passé en paramètre
 *  @param data {string} le texte à décrypter
 *  @param key {string} la clé à utiliser pour décrypter
 */
const decode = function(data,key) {
    if(data && typeof (data) =='object'){
        key = defaultStr(data.key)
        data = defaultStr(data.pass,data.password);
    }
    try {
        data = Base64.decode(data).toString();
    } catch {
        return '';
    }
    return xorEncodeDecode(data,key);
}

/*** xorEncrpt end decrypt */
function xorEncodeDecode(txt, pass) {
    if(!txt || typeof(txt) !== 'string') return "";
    if(!(pass) || typeof pass !== 'string') return txt;
    let ord = []
    let buf = ""
 
    for (let z = 1; z <= 255; z++) {
        ord[String.fromCharCode(z)] = z
    }
 
    let j = 0;
    let z = 0;
    for (z = 0; z < txt.length; z++) {
        if(j >= pass.length) break;
        buf += String.fromCharCode(ord[txt.substr(z, 1)] ^ ord[pass.substr(j, 1)])
        j = (j < pass.length) ? j + 1 : 0
    }
 
    return buf
 
}
export {
    encode,
    decode,
    encode as encrypt,
    decode as decrypt,
 }

 export default {
    encode,
    decode,
    encrypt:encode,
    decrypt : decode,
 }