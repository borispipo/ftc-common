// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

const {stringify:stringifyJSON,parse} = JSON;
import {isRegExp} from "./isRegex";
export const decycle = function decycle(obj, stack = []) {
    if(typeof obj ==='function') return undefined;
    if (!obj || typeof obj !== 'object')
        return obj;
    
    if (stack.includes(obj))
        return null;

    let s = stack.concat([obj]);

    return Array.isArray(obj)
        ? obj.map(x => decycle(x, s))
        : Object.fromEntries(
            Object.entries(obj)
                .map(([k, v]) => [k, decycle(v, s)]));
}

export const stringify = function(jsonObj,decylcleVal){
    return isJSON(jsonObj) ? jsonObj : JSON.stringify(decylcleVal !== false ? decycle(jsonObj) : jsonObj);
}
/****
    Prend en paramètre une chaine de caractère et détermine s'il s'agit d'un JSON encodé
    @param {json_string}, la chine de caractère à vérifier
    @return {boolean}
*/
export const isJSON = function (json_string){
    if(!json_string || typeof json_string != 'string') return false;
    var text = json_string;
    return !(/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(text.replace(/"(\\.|[^"\\])*"/g, '')));
}

/***
 * parse JSON string recursively
 * @param {string} json string to parse
 * @return {object} or null, parse json
 */
 export const  parseJSON  = function(jsonStr){
    if(!isJSON(jsonStr)) {
        if(jsonStr && typeof(jsonStr) == 'object'){
            for(var i in jsonStr){
                jsonStr[i] = parseJSON(jsonStr[i]);
            }
        }
        return jsonStr;
    }
    try {
        jsonStr = JSON.parse(jsonStr);
        if(jsonStr && typeof(jsonStr) == 'object'){
            for(var i in jsonStr){
                jsonStr[i] = parseJSON(jsonStr[i]);
            }
        }
    } catch(e){
        return jsonStr;
    }
    return jsonStr;
}


function replacer(key, value) {
    if (isRegExp(value))
      return value.toString();
    else
      return value;
}
  
  function reviver(key, value) {
    if (isRegExp(value) && !(value instanceof RegExp)) {
      return new RegExp(value);
    } else
      return value;
  }

JSON.stringify = function(o,replacerFunc,...rest){
    const context = this || JSON;
    replacerFunc = typeof replacerFunc =='function' ? replacerFunc : (key,value)=>value;
    return stringifyJSON.call(context,o,(key,value,...rest)=>{
        return replacerFunc.call(context,key,replacer(key,value),...rest);
    },...rest);
}
JSON.parse = function(o,reviverFunc,...rest){
    reviverFunc = typeof reviverFunc =='function'? reviverFunc : (key,value)=>value;
    const context = this || JSON;
    return parse.call(context,o,(key,value,...rest)=>{
        return reviverFunc.call(context,o,reviver(key,value),...rest);
    },...rest);
}

/***
    détermine si l'objet obj ou la valeur obj est un objet json serialiazable
    @param {any} obj
    @return {boolean}
*/
export const isSerializableJSON = function(obj) {
    if(obj === undefined || obj === null || ["number","boolean","string"].includes(typeof obj)) return true;
    if(typeof obj !== "object") return false;
    for (let key in obj) {
      if (!isSerializableJSON(obj[key])) {
        return false;
      }
    }
    return true;
};
if(typeof JSON.isSerializable !== "function"){
    JSON.isSerializable = isSerializableJSON;
}