import { USER_SESSION_KEY} from "./session";
import APP from "$capp/instance";
import $session from "$session";
import { updateTheme } from "./session";
import {isObj,isNonNullString} from "$cutils";

/**** connecte l'utilisateur actuel */
export default function login (user,trigger){
    if(typeof user =='boolean'){
        trigger = user;
        user = trigger;
    }
    try {
        if(isObj(user) && isNonNullString(user.code)){
            $session.set(USER_SESSION_KEY,user);
            updateTheme(user);
            if(trigger !== false){
                APP.trigger(APP.EVENTS.AUTH_LOGIN_USER,user);
            }
            return true;
        }
    } catch(e){
        console.log(e," is errror rloggin user hein");
        return false;
    }
    return false;
}