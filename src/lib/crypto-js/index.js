const CryptoJS = require("crypto-js"); 
const AES = require("crypto-js/aes");


/*** crypte le message prase passé en paramètre
 *  @param data {string} le texte à crypter
 *  @parm key {string} la clé à utiliser pour crypter
 */
const encode = function(data,key) {
    return AES.encrypt(data,key);
};
/*** décrypte le texte passé en paramètre
 *  @param data {string} le texte à décrypter
 *  @param key {string} la clé à utiliser pour décrypter
 */
const decode = function(data,key) {
    return AES.decrypt(data,key);
}

export const encrypt = encode;

export const decrypt = decode;

export {CryptoJS};

export default {
    ...CryptoJS,
    encode,encrypt,
    decode, decrypt,
    AES, CryptoJS,
}