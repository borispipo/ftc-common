import {sanitizeKey,handleGetValue,handleSetValue} from "./utils";
const storage = typeof window !='undefined' && window && window.localStorage || undefined;
export const set = (key,value,decycle)=>{
    if(!storage) return Promise.reject({message:'Unable to store session data, localstorage not available on client'});
    key = sanitizeKey(key);
    const r = key && typeof key =='string'? storage.setItem(key,handleSetValue(value,decycle)) : undefined;
    return Promise.resolve(r);
}
export const get = (key) => {
    if(!storage) return undefined;
    key = sanitizeKey(key);
    return key && typeof key =='string' ? handleGetValue(storage.getItem(key)) : undefined;
}

export default {get,set}