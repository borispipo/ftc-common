import {isElectron} from "$cplatform";

export default function getPouchDBNamePrefix(x){
    let pref = "";
    if(isElectron() && window.ELECTRON){
        pref = ELECTRON.databasePath;
    }
    if(typeof(pref) =="function") pref = pref();
    pref = defaultStr(pref).toLowerCase().trim();
    if(isNonNullString(pref)){
        pref = pref.replaceAll("\\","/").rtrim("/")+"/";
    }
    return pref;
}