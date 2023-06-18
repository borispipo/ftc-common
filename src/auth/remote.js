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
import { getLoggedUser,getLoginId } from "./utils/session";
import {isObj,defaultObj,extendObj,isPlainObject} from "$cutils";
///cet alias sert à customiser les fonction d'authentification et de déconnection d'un utilisateur
import {isPromise,isNonNullString} from "$cutils";
import appConfig from "$capp/config";
import SignIn2SignOut from "./$authSignIn2SignOut";

export {SignIn2SignOut};

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
    const {response,userId,done,token,preferences,fetchResponse,res,status,...rest}=  defaultObj(args);
    if(isCustom || (isObj(response) && (response.success || response.status ==200))){
      delete user.password;
      Object.map(rest,(v,i)=>{
        if(!(i in user) && typeof v !=='function'){
          if(typeof v =='object' && !isPlainObject(v)) return;
          user[i] = v;
        }
      });
      extendObj(user,preferences);
      if(token){
        setToken(token);
      }
      delete user.token;
      delete user.password;
      delete user.pass;
      login(user,typeof trigger =='boolean'? trigger : true);
      if(typeof callback ==='function'){
          callback(user);
      }
    }
    return {response,user,userId,token,...rest};
  }).catch((e)=>{
      console.log(e.stackTrace|| e.message || e.msg," unable to signIn user")
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
      const logU = defaultObj(getLoggedUser());
      if(logU.code == u.code || logU.id == u.id){
        Object.map(logU,(v,i)=>{
          if(!(i in u)){
             u [i] = v;
          }
        });
      }
      if(typeof SignIn2SignOut.upsertUser =='function'){
          promise = SignIn2SignOut.upsertUser({user:u});
      } 
      const cb = x=> {
        login(u,trigger)
      };
      if(isPromise(promise)){
         return promise.then(cb).catch((e)=>{
          console.log(e.message || e.stackTrace || e.msg," upsert user");
         });
      } else {
        cb();
      }
     }
     return Promise.resolve(u);
  };

  const getUProps = (user,functionName,propsName)=>{
    user = defaultObj(user,getLoggedUser());
    if(typeof SignIn2SignOut[functionName] =='function'){
       return SignIn2SignOut[functionName](user);
    }
    return user[propsName];
  }

/*** retourne le username de l'utilsateur passé en paramètre */
export const getUserName = (user)=>{
     return getUProps(user,"getUserName","userName");
}
/*** retourne le pseudo de l'utilisateur passé en paramètre */
export const getUserPseudo = (user)=>{
    return getUProps(user,"getUserPseudo","pseudo");
}

export const getUserFirstName = (user)=>{
  return getUProps(user,"getUserFirstName","firstName");
}

export const getUserLastName = (user)=>{
  return getUProps(user,"getUserLastName","lastName");
}

export const getUserSurname = (user)=>{
  return getUProps(user,"getUserSurname","surname");
}

export const getUserFullName = (user)=>{
  const fullName = getUProps(user,"getUserFullName","fullName");
  if(!fullName){
    let firstName = getUserFirstName(), lastName = getUserLastName();
    if(isNonNullString(firstName) && isNonNullString(lastName)){
       if(firstName.toLowerCase() != lastName.toLowerCase()){
         return firstName +" "+lastName;
       }
    }
    return firstName;
  }
  return fullName;
}

export const getUserEmail = (user)=>{
  return getUProps(user,"getUserEmail","email");
}
export const getUserCode = (user)=>{
  return getUProps(user,"getUserCode","code");
}