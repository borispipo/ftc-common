import CryptoES from 'crypto-es';


/*** crypte le message prase passé en paramètre
 *  @param data {string} le texte à crypter
 *  @parm key {string} la clé à utiliser pour crypter
 */
const encode = function(data,key) {
    return CryptoES.AES.encrypt(data,key);
};
/*** décrypte le texte passé en paramètre
 *  @param data {string} le texte à décrypter
 *  @param key {string} la clé à utiliser pour décrypter
 */
const decode = function(data,key) {
    return CryptoES.AES.decrypt(data,key);
}

export const encrypt = encode;

export const decrypt = decode;

export {CryptoES as CryptoJS};
export {CryptoES};

export default {
    ...CryptoES,
    encode,encrypt,
    decode, decrypt,
}