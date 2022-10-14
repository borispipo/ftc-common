import React from "react";
import "$utils/extend.prototypes";

const isNonNullString = x=> x && typeof x =='string';
const configRef = React.createRef();

export const getConfig = x=>typeof configRef.current =="object" && configRef.current? configRef.current : {};
export const setConfig = configValue=> {
    if(typeof configValue =="object" && configValue && !Array.isArray(configValue)){
        configRef.current = configValue;
    }
}

export const getValue = function(){
    const conf = getConfig();
    const args = Array.prototype.slice.call(arguments,0);
    let hasKey = false;
    for(let i in args){
        const a = args[i];
        if(isNonNullString(a)){
            hasKey = true;
            if(conf.hasOwnProperty(a)){
                return conf[a];
            }
        }
    }
    return hasKey ? undefined : conf;
}
export const getConfigValue = getValue;

const config = {
    get current(){
        return getConfig();
    },
    set current(configValue){
        return setConfig(configValue);
    },
    get name (){
        return getName();
    },
    get description (){
        return getDescription();
    },
    get version (){
        return getVersion();
    },
    get env (){
        return getEnv();
    },
    get realeaseDateStr (){
        return getReleaseDateStr();
    },
    get releaseDate (){
        return getReleaseDate();
    },
    get devMail (){
        return getDevMail();
    },
    get devWebsite(){
        return getDevWebsite();
    },
    get copyRight (){
        return getCopyRight();
    },
    get author(){
        return getAuthor();
    },
    //l'unique id de l'application
    get id (){
        return getValue("id");
    },
    get appId (){
        return getAppId();
    },
    get apiVersion(){
        return getAppVersion();
    },
    get prefixWithAppId (){
        return prefixStrWithAppId;
    }
}

export const getName = x=>getValue("name");
export const getDescription = x=>getValue("description","desc");
export const getDesc = getDescription;
export const getVersion = x=>getValue("version");
export const getEnv = x=>getValue("env");
export const getReleaseDateStr = x=>getValue("realeaseDateStr");
export const getReleaseDate = x=>getValue("releaseDate");
export const getDevMail = x=>getValue("devMail");
export const getDevWebsite = x=>getValue("devWebsite");
export const getCopyRight = x=>getValue("copyRight");
export const getAuthor = x=>getValue("author");
export const getAppId = x=>getValue("appId");
export const getAppVersion = x=>getValue("apiVersion");

export const prefixStrWithAppId = (text,sep)=>{
    const appId = getAppId();
    if(typeof text !=="string") return appId;
    sep = typeof sep =="string"? sep : "-";
    let r = appId+sep;
    return r+text.ltrim(r); 
}
export const prefixWithAppId = prefixStrWithAppId;

export default config;