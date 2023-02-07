// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { USER_SESSION_KEY} from "./session";
import APP from "$capp/instance";
import $session from "$session";
import { updateTheme,getLoggedUser } from "./session";
import {isObj,isNonNullString} from "$cutils";
import { resetPerms } from "../perms/reset";

/**** connecte l'utilisateur actuel */
export default function login (user,trigger){
    if(typeof user =='boolean'){
        trigger = user;
        user = trigger;
    }
    if(!isObj(user)){
        user = getLoggedUser();
    }
    try {
        if(isObj(user) && isNonNullString(user.code)){
            $session.set(USER_SESSION_KEY,user);
            updateTheme(user);
            if(trigger !== false){
                resetPerms();
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