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

const USER_SESSION_KEY = "user-session";

export const TOKEN_SESSION_KEY = "user-token-key";

const encryptKey  ="auth-decrypted-key";

const isValidU = u=> isObj(u) && Object.size(u,true) && (hasToken() || isNonNullString(u.code));

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
  
/*** check wheater the singleUserAllowed mode is enabled
 * 
 */
export const isSingleUserAllowed = ()=>{
  return (!!appConfig.isAuthSingleUserAllowed && isObj(appConfig.authDefaultUser)) && true || false;
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
    const defUser = appConfig.authDefaultUser;
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
        const decoded = crypToJS.decode(encrypted,encryptKey);
        if(isJSON(decoded)){
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

export const getLoggedUserCode = ()=>{
  const u = getLocalUser();
  if(u) {
   return defaultStr(u.code,u.pseudo,u.id,u.email)
  }
  return "";
}

export const getLoggedUserId = ()=>{
  const u = getLocalUser();
  if(u) {
   return defaultStr(u.id)
  }
  return "";
}

const localUserRef = {current:null};

export const setLocalUser = u => {
  if(!isClientSide()) return null;
  const uToSave = isObj(u)? u : null;
  localUserRef.current = uToSave;
  let encrypted = null;
  try {
    encrypted = crypToJS.encode(JSON.stringify(uToSave),encryptKey);
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
  if(!isNonNullString(userCode)) return false;
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

/*** déconnecte l'utilisateur actuel */
export const logout = () =>{
    if(!isClientSide()) return null;
    resetPerms();
    $session.set(USER_SESSION_KEY,"");
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
