import { handleGetValue,handleSetValue } from './utils'
import storage from "./native";
const get = key => handleGetValue(storage.get(key))
let set = (key,value,decycle)=>{
    return Promise.resolve(storage.set(key,handleSetValue(value,decycle)));
}

export default {get,set};

export {get,set}