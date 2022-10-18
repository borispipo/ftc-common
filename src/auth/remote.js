// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {logout,setToken,isLoggedIn} from "./utils";
import login from "./utils/login";
import {post} from "$capi";
import {navigate} from "$cnavigation";
import notify from "$active-platform/notify";
import i18n from "$ci18n";
import {SIGN_IN,SIGN_OUT,} from "./routes";
import { getLoggedUser } from "./utils/session";
import {isObj,defaultObj} from "$cutils";
///cet alias sert à customiser les fonction d'authentification et de déconnection d'un utilisateur
import S2Out from "$signIn2SignOut";



/*** cette variable sert à personnaliser les fonction d'authentification/connexion signIn et de déconnexion signOut d'un utilisateur côté client */
export const SignIn2SignOut = typeof S2Out =='object' && S2Out ? S2Out : {};

export const isSignedIn = isLoggedIn;

/***** 
 * authentifie l'utilisateur passé en paramètre
 * 
 */
export const signIn = (user,callback)=>{
  const isCustom = typeof SignIn2SignOut.signIn =='function';
  return (isCustom?SignIn2SignOut.signIn({
    user,
  }):post({
      isAuth : true,
      json : true,
      url : SIGN_IN,
      body : user
  })).then(({response,userId,token,...rest})=>{
    if(isCustom || (isObj(response) && response.success)){
      delete user.password;
      user.id = defaultStr(userId,user.id,user.code,user.email);
      user.code = defaultStr(user.code,user.email);
      if(token){
        user.token = token;
        setToken({userId,token});
      }
      delete user.password;
      delete user.pass;
      login(user,true);
      if(typeof callback ==='function'){
          callback(user);
      }
    }
    return {response,user,userId,token,...rest};
  }).catch((e)=>{
      console.log(e," unable to signIn user")
      notify.error({...defaultObj(e),position:'top'});
      logout();
      throw e;
  })
}

/**** signOut current user */
export const signOut = (callback,user)=>{
  const isCustom = typeof SignIn2SignOut.signOut =='function';
  const cb = ()=>{
    logout(null);
    setToken(null);
    if(typeof callback =='function'){
       callback();
    }
    if(callback === false) return;
    notify.success(i18n.lang("you_are_successfull_logged_out"))
  }
  return (isCustom?SignIn2SignOut.signOut({
    user : defaultObj(user,getLoggedUser()),
  }):post({
      url : SIGN_OUT
  })).catch((e)=>{
      return e;
    }).finally(cb);
}

/*** déconnecte l'utilisateur et le redirige vers la page voulue redirectStr
 * @param {string|boolean} redirectStr : l'url de redirection une fois déconecté l'utilisateur
 * @param {boolean|string} si un message de notification sera envoyée
 */
 export const signOut2Redirect = (redirectStr,notifyUser)=>{
    if(typeof redirectStr ==='boolean'){
      notifyUser = redirectStr;
    }
    const notifyMessage = typeof notifyUser ==='string'? notifyUser : undefined;
    notifyUser = typeof notifyUser =='boolean'? notifyUser : true;
  
    redirectStr = typeof redirectStr =="string"? redirectStr : SIGN_IN;
    return signOut(false).then(()=>{
       navigate(redirectStr);
       if(notifyUser){
          notify.warning(defaultStr(notifyMessage,i18n.lang("you_have_been_redirected_to_homepage")));
       }
       return redirectStr;
    });
  }
  export const upsertUser = (u)=> {
     if(isObj(u) && isNonNullString(u.email)){
       login(u);
     }
     return Promise.resolve(u);
  };