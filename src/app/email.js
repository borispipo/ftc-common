import {isElectron} from "$cplatform";
import {isObj} from "$cutils";

export const canSendMail = ()=>{
    if(!isElectron() || !isObj(ELECTRON.EMAIL)) return false;
    return ELECTRON.EMAIL.isAvailable(); 
}