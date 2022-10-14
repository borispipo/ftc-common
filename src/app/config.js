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

export const getConfigValue = function(){
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
        return getConfigValue("id");
    },
    get appId (){
        return getAppId();
    },
    get apiVersion(){
        return getAppVersion();
    },
    get prefixWithAppId (){
        return prefixStrWithAppId;
    },
    get feeds (){
        return getFeeds();
    }
}

export const getName = x=>getConfigValue("name");
export const getDescription = x=>getConfigValue("description","desc");
export const getDesc = getDescription;
export const getVersion = x=>getConfigValue("version");
export const getEnv = x=>getConfigValue("env");
export const getReleaseDateStr = x=>getConfigValue("realeaseDateStr");
export const getReleaseDate = x=>getConfigValue("releaseDate");
export const getDevMail = x=>getConfigValue("devMail");
export const getDevWebsite = x=>getConfigValue("devWebsite");
export const getCopyRight = x=>getConfigValue("copyRight");
export const getAuthor = x=>getConfigValue("author");
export const getAppId = x=>getConfigValue("appId");
export const getAppVersion = x=>getConfigValue("apiVersion");
export const getFeeds = x=>getConfigValue("feeds");

export const prefixStrWithAppId = (text,sep)=>{
    const appId = getAppId();
    if(typeof text !=="string") return appId;
    sep = typeof sep =="string"? sep : "-";
    let r = appId+sep;
    return r+text.ltrim(r); 
}
export const prefixWithAppId = prefixStrWithAppId;

export default config;