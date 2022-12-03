// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import "$cutils/extend.prototypes";
import isNonNullString from "$cutils/isNonNullString";
import device from "./device";
import session from "$session";
import { isValidURL } from "$cutils/uri";

const configRef = {current:null};

const sessionDatatKey = "app-config-session-data-key";
const sessionAPIHostKey = "app-config-session-api-host";

export const getConfig = x=>typeof configRef.current =="object" && configRef.current? configRef.current : {};

const isInitializedRef = {current:false};
export const setConfig = configValue=> {
    if(typeof configValue =="object" && configValue && !Array.isArray(configValue)){
        configRef.current = configValue;
        isInitializedRef.current = true;
    }
}
const countryCodeSessionKey = "countryCodeSessionKey";
export const getCountryCode = ()=>{
    const s = session.get(countryCodeSessionKey);
    return s && typeof s =='string'? s.trim() : "";
}
export const getSessionData = (key)=>{
    const d = session.get(sessionDatatKey);
    const sData = d && typeof d =='object' && !Array.isArray(d) ? d : {};
    if(isNonNullString(key)) return sData[key];
    return sData;
}
export const setSessionData = (key,value)=>{
    let data = getSessionData();
    if(key && typeof key =='object' && !Array.isArray(key)){
        data = {...data,...key};
    } else if(isNonNullString(key)){
        data [key] = value;
    }
    session.set(sessionDatatKey,data);
    return data;
}
export const setCountryCode = (code)=>{
    session.get(countryCodeSessionKey,code && typeof code=='string'&& code || '');
    return code;
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
/** récupère le lien api host définie dans les configurations de l'application */
export const getAPIHost = ()=>{
    const host = session.get(sessionAPIHostKey);
    return isValidURL(host)? host : null; 
}
///Spécifie le lien apihost
export const setAPIHost = (newAPIHost)=>{
    newAPIHost = isValidURL(newAPIHost)? newAPIHost : "";
    session.set(sessionAPIHostKey,newAPIHost);
    return true;
}
export const getSWR = ()=>{
    const swr = getSessionData("swr");
    return swr && typeof swr =='object' && !Array.isArray(swr)? swr : {};
}
export const setSWR = (swr)=>{
    swr = swr && typeof swr =='object' && !Array.isArray(swr)? swr : {};
    return setSessionData('swr',swr);
}
const config = {
    get current(){
        return getConfig();
    },
    set current(configValue){
        return setConfig(configValue);
    },
    get theme () {
        return getTheme();
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
    get copyright (){
        return getCopyright();
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
    },
    ///le préfixe de base de données pouchdb local
    get dbNamePrefix(){
        return getDBNamePrefix();
    },
    get pouchdbPrefix(){
        return getDBNamePrefix();
    },
    get pouchdbNamePrefix (){
        return getDBNamePrefix();
    },
    get backgroundTasks (){
        return canRunBackgroundTasks();
    },
    get canRunBackgroundTasks (){
        return canRunBackgroundTasks;
    },
    get device (){
        return device;
    },
    get deviceId (){
        return device.get();
    },
    set deviceId (deviceIdOrDeviceIdGetter){
        return device.set(deviceIdOrDeviceIdGetter);
    },
    get getDeviceId(){
        return device.get;
    },
    get setDeviceId(){
        return device.set;
    },
    get get (){
        return getConfigValue;
    },
    get getValue (){
        return getConfigValue;
    },
    get currency(){
        return getCurrency();
    },
    set currency(currency){
        setCurrency(currency);
    },
    get setCurrency(){
        return setCurrency;
    },
    get init (){
        return getInit();
    },
    /*** si le fichier de configuration a déjà été initialié */
    get initialized (){
        return isInitialized();
    },
    get isInitialized(){
        return isInitialized();
    },
    get countryCode(){
        return getCountryCode();
    },
    set countryCode(code){
        return setCountryCode(code);
    },
    get setCountryCode(){
        return setCountryCode;
    },
    get getSessionData(){
        return getSessionData;
    },
    get setSessionData(){
        return setSessionData;
    },
    /*** retourne l'api host */
    get API_HOST (){ 
        return getAPIHost();
    },
    set API_HOST (newAPIHost){
        return setAPIHost(newAPIHost);
    },
    get swr (){
        return getSWR();
    },
    set swr(value){
        return setSWR(value);
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
export const getCopyright = x=>getConfigValue("copyRight");
export const getAuthor = x=>getConfigValue("author");
export const getAppId = x=>getConfigValue("appId");
export const getAppVersion = x=>getConfigValue("apiVersion");
export const getFeeds = x=>getConfigValue("feeds");
export const getDBNamePrefix = x=> getConfigValue("dbNamePrefix","pouchdbPrefix","pouchdbNamePrefix") || getAppId();
export const canRunBackgroundTasks = x=>getConfigValue("runBackgroundTasks","canRunBackgroundTasks","backgroundTasks");
export const getCurrency = ()=> Object.assign({},session.get("appConfigCurrency"));
export const getInit = ()=>{
    return getConfigValue("init");
}
export const isInitialized = ()=>{
    return isInitializedRef.current;;
}
export const setCurrency = (currency)=>{
    return session.set("appConfigCurrency",Object.assign({},currency));
}
export const getTheme  =x=>{
    const t = getConfigValue("theme");
    if(typeof t =='object' && t && !Array.isArray(t)){
        return t;
    }
    return {};
}

export const prefixStrWithAppId = (text,sep)=>{
    const appId = getAppId();
    if(typeof text !=="string") return appId;
    sep = typeof sep =="string"? sep : "-";
    let r = appId+sep;
    return r+text.ltrim(r); 
}
export const prefixWithAppId = prefixStrWithAppId;

export default config;