import APP from "./instance";

let ___isInitialized = false;

export const setIsInitialized = b =>{
    if(typeof b =='boolean'){
        ___isInitialized = b;
        APP.trigger(APP.EVENTS.IS_INITIALIZED,b);
    }
}

export const isInitialized = x=> ___isInitialized;
