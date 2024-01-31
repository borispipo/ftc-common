
import defaultStr from "$cutils/defaultStr";
const pJson = Object.clone(Object.assign({},require("$packageJSON")));
import "../utils/extendObj";

export const getPackageJson = ()=>{
    return Object.clone(pJson);
}

export const getAppId = x=>{
    const appID = defaultStr(pJson?.appId,pJson?.id);
    if(appID){
        return appID;
    }
    return getName().trim().replaceAll(" ",".");
};

export const getName = x=>defaultStr(pJson.name).trim().toUpperCase();

export const prefixStrWithAppId = (text,sep)=>{
    const appId = getAppId();
    if(isInitializedRef.current && !isNonNullString(appId) && typeof window !='undefined' && typeof window =='object' && window){
        console.error("Id de l'application non définie dans le fichier de configuration. vous devez le définir comme chaine de caractère non nulle dans la propriété appId ou id de ce même fichier");
    }
    if(typeof text !=="string") return appId;
    sep = typeof sep =="string"? sep : "-";
    const r = appId+sep;
    return r+text.trim().ltrim(r); 
}