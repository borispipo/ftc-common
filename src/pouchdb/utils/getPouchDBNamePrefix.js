import {isElectron} from "$cplatform";
import {defaultStr} from "$cutils";

export default function getPouchDBNamePrefix(x){
    let pref = "",prefIsElectron = false;
    if(isElectron() &&  window?.ELECTRON && typeof(ELECTRON.getDatabasePath) =="function"){
        pref = ELECTRON.getDatabasePath() || "";
        prefIsElectron = true;
    }
    if(typeof(pref) =="function") pref = pref();
    pref = defaultStr(pref).trim();
    if(!prefIsElectron){
        pref = pref.toLowerCase();
    }
    if(pref){
        pref = pref.replaceAll("\\","/").rtrim("/")+"/";
    }
    return pref;
}