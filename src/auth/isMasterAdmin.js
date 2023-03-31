// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { getLoggedUser,isSingleUserAllowed,getDefaultSingleUser } from "./utils/session";
import {defaultObj} from "$cutils";
import SignIn2SignOut from "./$authSignIn2SignOut";

/**** vérifie si l'utilisateur connecté/passé en paramètre est le super user
 * si le mode single user est admis alors par défaut l'utilisateur par défaut est le master admin
 */
export default function isAuthMasterAdmin(user){
    if(isSingleUserAllowed()){
        return getDefaultSingleUser();
    }
    user = defaultObj(user,getLoggedUser());
    if(typeof SignIn2SignOut.isMasterAdmin =='function'){
        return SignIn2SignOut.isMasterAdmin(user);
    }
    return false;
}