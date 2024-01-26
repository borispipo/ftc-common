import {isElectron} from "$cplatform";
import {isNonNullString,defaultStr} from "$cutils";

export default function getPouchDBNamePrefix(x){
    let pref = "";
    if(isElectron() &&  window?.ELECTRON && typeof(ELECTRON.getDatabasePath) =="function"){
        pref = ELECTRON.getDatabasePath() || "";
    }
    if(typeof(pref) =="function") pref = pref();
    pref = defaultStr(pref).toLowerCase().trim();
    if(isNonNullString(pref)){
        pref = pref.replaceAll("\\","/").rtrim("/")+"/";
    }
    return pref;
}