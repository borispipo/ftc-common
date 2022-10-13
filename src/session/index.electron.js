import {handleGetValue,handleSetValue} from "./utils";
import {isElectron} from "$platform";
let get, set
if(isElectron() && window.ELECTRON && typeof ELECTRON.SESSION=="object" && ELECTRON.SESSION){
    if(typeof ELECTRON.SESSION.set =='function'){
        set = (key,value,decycle)=>{
            return Promise.resolve(ELECTRON.SESSION.set(key,handleSetValue(value,decycle)));
        }
    }
    if(typeof ELECTRON.SESSION.get =="function"){
        get = key => handleGetValue(ELECTRON.get(key));
    }
}

export default {get,set};

export {get,set}

export {AsyncStorage} from '@react-native-async-storage/async-storage';