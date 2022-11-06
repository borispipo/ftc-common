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
import {isObj,defaultObj,extendObj} from "$cutils";
///cet alias sert à customiser les fonction d'authentification et de déconnection d'un utilisateur
import S2Out from "$signIn2SignOut";
import {isPromise} from "$utils";
import appConfig from "$capp/config";



/*** cette variable sert à personnaliser les fonction d'authentification/connexion signIn et de déconnexion signOut d'un utilisateur côté client */
export const SignIn2SignOut = typeof S2Out =='object' && S2Out ? S2Out : {};

export const isSignedIn = isLoggedIn;

/***** 
 * authentifie l'utilisateur passé en paramètre
 * @param {object} user - les données de l'utilisateur qu'on souhaite authentifier
 * @param {function|boolean} callback la fonction de rappel où le boolean spécifiant que le trigger relative à l'authentification de l'utilisateur sera déclanché
 * @param {boolean|function} trigger . si le l'évènement relative à la connexion de l'utilisateur sera déclenché où pas
 */
export const signIn = (user,callback,trigger)=>{
  const deviceId = defaultStr(appConfig.deviceId);
  if(deviceId && isObj(user) && !user.deviceId){
    user.deviceId = deviceId;
  }
  if(typeof callback =='boolean'){
    const t = trigger;
    trigger = callback;
    callback = t;
  }
  const isCustom = typeof SignIn2SignOut.signIn =='function';
  return (isCustom?SignIn2SignOut.signIn({
    user,
  }):post({
      isAuth : true,
      json : true,
      url : SIGN_IN,
      body : user
  })).then((args)=>{
    const {response,userId,done,token,...rest}=  defaultObj(args);
    if(isCustom || (isObj(response) && (response.success || response.status ==200))){
      delete user.password;
      extendObj(user,rest);
      user.id = defaultStr(userId,user.id,user.code,user.email);
      user.code = defaultStr(user.code,user.pseudo,user.email,user.id);
      if(token){
        user.token = token;
        setToken(token);
      }
      delete user.password;
      delete user.pass;
      login(user,typeof trigger =='boolean'? trigger : true);
      if(typeof callback ==='function'){
          callback(user);
      }
    }
    return {response,user,userId,token,...rest};
  }).catch((e)=>{
      console.log(e," unable to signIn user")
      notify.error({...defaultObj(e),position:'top'});
      //logout();
      throw e;
  })
}

/**** signOut current user 
 * @param {function} callback - la fonction de rappel
 * @param {object|boolean} user - l'utilisateur où le boolean relative au déclancherment où non de la fonction de rappel
 * @param {boolean} trigger - si l'évènement relatif à la déconnection de l'utilisateur sera déclenché où pas
*/
export const signOut = (callback,user,trigger)=>{
  const isCustom = typeof SignIn2SignOut.signOut =='function';
  if(typeof user =='boolean'){
      const t = trigger;
      trigger = user;
      user = t;
  }
  user = defaultObj(user,getLoggedUser());
  const deviceId = defaultStr(appConfig.deviceId);
  if(deviceId && !user.deviceId){
    user.deviceId = deviceId;
  }
  const cb = ()=>{
    logout(null,typeof trigger =='boolean'? trigger : true);
    setToken(null);
    if(typeof callback =='function'){
       callback();
    }
    if(callback === false) return;
    notify.success(i18n.lang("you_are_successfull_logged_out"))
  }
  return (isCustom?SignIn2SignOut.signOut({user}):post({
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
  /***permet d'upsert un utilisateur, update ses données*/
  export const upsertUser = (u,trigger)=> {
     if(isObj(u)){
      let promise = null;
      if(typeof SignIn2SignOut.upsertUser =='function'){
          promise = SignIn2SignOut.upsertUser({user:u});
      } 
      const cb = x=> {
        const lU = defaultObj(getLoggedUser());
        const user = {...lU,...defaultObj(u)};
        login(user,trigger)
      };
      if(isPromise(promise)){
         promise.then(cb).catch((e)=>{
          console.log(e," upsert user");
         });
      } else {
        cb();
      }
     }
     return Promise.resolve(u);
  };