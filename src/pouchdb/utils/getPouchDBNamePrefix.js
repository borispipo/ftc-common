import {isElectron} from "$cplatform";
import {isNonNullString,defaultStr} from "$cutils";

export default function getPouchDBNamePrefix(x){
    let pref = "";
    if(isElectron() && typeof ELECTRON !=='object' && ELECTRON && isNonNullString(ELECTRON.databasePath)){
        pref = ELECTRON.databasePath;
    }
    if(typeof(pref) =="function") pref = pref();
    pref = defaultStr(pref).toLowerCase().trim();
    if(isNonNullString(pref)){
        pref = pref.replaceAll("\\","/").rtrim("/")+"/";
    }
    return pref;
}