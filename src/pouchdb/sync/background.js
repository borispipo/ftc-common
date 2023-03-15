import {isBool,isNonNullString,defaultVal} from "$cutils";

const syncManagers = {};
const backgroundRef = {current:false};

export const setBackground = (rest)=>{
    if(isBool(rest)){
        backgroundRef.current = rest;
    } else if(isObj(rest)) {
        backgroundRef.current = defaultVal(rest.background,false)?true : false;
    }
    return backgroundRef.current;
}

export const isDBSyncBackground = x=>backgroundRef.current;
export const setDBSyncBackground = setBackground;
export const isNotDBSyncBackground = ()=> !backgroundRef.current;
export const getDBSyncManager = x=> syncManagers;
export default {
    isDBSyncBackground,
    setDBSyncBackground,
    isNotDBSyncBackground,
    getDBSyncManager
}
