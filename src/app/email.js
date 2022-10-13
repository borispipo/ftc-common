import {isElectron} from "$platform";
import {isObj} from "$utils";

export const canSendMail = ()=>{
    if(!isElectron() || !isObj(ELECTRON.EMAIL)) return false;
    return ELECTRON.EMAIL.isAvailable(); 
}