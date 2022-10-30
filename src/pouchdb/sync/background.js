let background = false;
const syncManagers = {};

export const setBackground = (rest)=>{
    if(isBool(rest)){
        background = rest;
    } else if(isObj(rest)) {
        background = defaultVal(rest.background,false)?true : false;
    }
    return background;
}

export const isDBSyncBackground = x=>background;
export const setDBSyncBackground = setBackground;
export const isNotDBSyncBackground = ()=> !background;
export const getDBSyncManager = x=> syncManagers;
export default {
    isDBSyncBackground,
    setDBSyncBackground,
    isNotDBSyncBackground,
    getDBSyncManager
}
