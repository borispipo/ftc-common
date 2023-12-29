// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import $session from "$session";
import {isObj,extendObj,isNonNullString,defaultStr,defaultObj} from "$cutils";
import {isJSON,parseJSON} from "$cutils/json";
import {isClientSide} from "$platform";
import APP from "$capp/instance";
import {updateTheme as uTheme} from "$theme";
import { getThemeData } from "$theme/utils";
import { resetPerms } from "../perms/reset";
import appConfig from "$app/config";
import crypToJS from "$clib/crypto-js";
import SignIn2SignOut from "../authSignIn2SignOut";

const USER_SESSION_KEY = "user-session";

export const TOKEN_SESSION_KEY = "user-token-key";

export const getEncryptKey = x=>defaultStr(appConfig.get("authSessionEncryptKey"),process.env.AUTH_SESSION_ENCRYPT_KEY,"auth-decrypted-key");

export const isValidLoginId = (loginId)=> isNonNullString(loginId) || typeof loginId ==='number';

const isValidU = u=> {
  if(!isObj(u) || !Object.size(u,true)) {
    return false;
  }
  return !!(hasToken() || String(getUserCode(u)));
};

export const isValidUser = isValidU;

export const getToken = ()=>{
    if(!isClientSide()) return null;
    const token = $session.get(TOKEN_SESSION_KEY);
    return isValidToken(token) ? token : null;
}
  export const setToken = (token)=>{
     if(!isClientSide()) return null;
     return $session.set(TOKEN_SESSION_KEY,token);
  }
  export const isValidToken = (token)=>{
     return isNonNullString(token)? true : false;
  }
  export const hasToken = ()=>{
    const token = getToken();
    return isValidToken(token);
  }

export const isLoggedIn = x => {
    const u = getLocalUser();
    return isValidU(u)  ? true : false;
}

export const isSignedIn = isLoggedIn;
  
/*** check wheater the singleUserAllowed mode is enabled
 * 
 */
export const isSingleUserAllowed = ()=>{
  return (!!appConfig.get("isAuthSingleUserAllowed") && isObj(appConfig.get("authDefaultUser"))) && true || false;
}

/*** check wheater the multi user is allowed on application */
export const isMultiUsersAllowed = ()=>{
  return !isSingleUserAllowed();
}
/*** return the default single user
 * when multiuser not allowed
 */
export const getDefaultSingleUser = ()=>{
  if(isSingleUserAllowed()){
    const defUser = appConfig.get("authDefaultUser");
    return isObj(defUser) && defUser || null;
  }
  return null;
}
export const getLocalUser = x=> {
    if(!isClientSide()) return null;
    if(isValidU(localUserRef.current)) return localUserRef.current;
    const encrypted = $session.get(USER_SESSION_KEY);
    const defaultUser = getDefaultSingleUser();
    if(isNonNullString(encrypted)){
      try {
        const ded = crypToJS.decode(encrypted,getEncryptKey());
        if(isObj(ded) && typeof ded?.toString =='function'){
          const decoded = ded.toString(crypToJS.enc.Utf8);
          const u = parseJSON(decoded);
          if(isValidU(u)){
            localUserRef.current = extendObj({},defaultUser,u);
            return localUserRef.current;
          }
        }
      } catch(e){
        console.log("getting local user ",e);
      }
    }
    return defaultUser ;
};

export const getLoggedUser = getLocalUser;

export const getLoggedUserCode = (data)=>{
  return getUserCode((isValidU(data) && data || getLocalUser()))
}

const localUserRef = {current:null};

export const setLocalUser = u => {
  if(!isClientSide()) return null;
  const uToSave = isValidU(u)? u : null;
  localUserRef.current = uToSave;
  let encrypted = null;
  try {
    encrypted = uToSave ? crypToJS.encode(JSON.stringify(uToSave),getEncryptKey()).toString() : null;
  } catch(e){
    localUserRef.current = null;
    console.log(e," setting local user");
  }
  return $session.set(USER_SESSION_KEY,encrypted)
}

export const DEFAULT_SESSION_NAME = "USER-DEFAULT-SESSION";

export const getSessionKey = (sessionName)=>{
  sessionName = defaultStr(sessionName,DEFAULT_SESSION_NAME);
  const userCode = getLoggedUserCode();
  if(!isValidLoginId(userCode)) return sessionName;
  return sessionName+"-"+userCode;
}

export const getSessionData = (sessionKey,sessionName)=>{
  if(!isClientSide()){
    return isNonNullString(sessionKey)? undefined : {};
  }
  const key = getSessionKey(sessionName);
  const dat = isNonNullString(key)? defaultObj($session.get(key)) : {};
  if(isNonNullString(sessionKey)){
      return dat[sessionKey]
  }
  return dat;
}

export const setSessionData = (sessionKey,sessionValue,sessionName)=>{
  if(!isClientSide()) return null;
  if(isObj(sessionKey)){
    sessionName = defaultStr(sessionName,sessionValue);
  }
  const key = getSessionKey(sessionName);
  if(!isNonNullString(key)) return false;
  let dat = defaultObj(getSessionData());
  if(isNonNullString(sessionKey)){
      dat[sessionKey] = sessionValue;
  } else if(isObj(sessionKey)){
      extendObj(dat,sessionKey);
  } else {
      return dat;
  }
  $session.set(key,dat);
  return dat;
}

export const canSignOut = ()=>{
  if(!isClientSide() || isSingleUserAllowed()) return false;
  return true;
}
export const canLogout = canSignOut;

/*** déconnecte l'utilisateur actuel */
export const logout = () =>{
    if(!canSignOut()) return null;
    resetPerms();
    setLocalUser(null);
    APP.trigger(APP.EVENTS.AUTH_LOGOUT_USER);
    return true;
}

export const updateTheme = (u)=>{
    if(!isObj(u)){
        u = getLoggedUser();
    }
    if(isObj(u) && isObj(u.theme) && u.theme.name && u.theme.primary){
        uTheme(getThemeData(u.theme).theme);
    }
}

const getUProps = (user,propsName,methodName)=>{
  user = defaultObj(user,getLoggedUser());
  if(SignIn2SignOut.hasMethod(methodName)){
      return SignIn2SignOut.call(methodName,user,propsName);
  }
  return SignIn2SignOut.getUserProp(user,propsName) || user[propsName];
}
/*** retourne le username de l'utilsateur passé en paramètre */
export const getUserName = (user)=>{
   return getUProps(user,"userName");
}
/*** retourne le pseudo de l'utilisateur passé en paramètre */
export const getUserPseudo = (user)=>{
  return getUProps(user,"pseudo","getUserPseudo");
}

export const getUserFirstName = (user)=>{
return getUProps(user,"firstName","getUserFirstName");
}

export const getUserLastName = (user)=>{
return getUProps(user,"lastName","getUserLastName");
}

export const getUserFullName = (user)=>{
const fullName = getUProps(user,"fullName","getUserFullName");
if(!isNonNullString(fullName)){
  let firstName = getUserFirstName(user), lastName = getUserLastName(user);
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
return getUProps(user,"email","getUserEmail");
}
export const getUserCode = (user)=>{
  return getUProps(user,"code","getUserCode");
}

export const getLoginId = (user)=>{
  const v = getUProps(user,"loginId","getLoginId");
  if(isValidLoginId(v)) return v;
  return getUserCode(user);
}