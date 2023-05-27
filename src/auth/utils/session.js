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

export const getEncryptKey = x=>defaultStr(appConfig.authSessionEncryptKey,process.env.AUTH_SESSION_ENCRYPT_KEY,"auth-decrypted-key");

export const getLoginIdField = ()=> {
  const loginId = defaultStr(appConfig.authLoginIdField,process.env.AUTH_LOGIN_ID_FIELD,"code").trim();
  const split = loginId.split(",").filter((t)=>!!isNonNullString(t));
  if(split.length > 1) return split;
  return split[0];
};
export const getLoginId = (data)=>{
  if(!isObj(data)) return "";
  const loginId = getLoginIdField();
  if(Array.isArray(loginId)){
     return loginId.filter((lId)=>!!(isNonNullString(data[lId])||typeof data[lId] =='number')).map((lId)=>data[lId]).join("/");
  }
  if(isNonNullString(data[loginId]) || typeof data[loginId] ==='number'){
    return data[loginId];
  }
  return "";
}
const isValidU = u=> {
  if(!isObj(u) || !Object.size(u,true)) {
    return false;
  }
  return !!(hasToken() || String(getLoginId(u)));
};

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
  return getLoginId((isValidU(data) && data || getLocalUser()))
}

export const getLoggedUserId = getLoggedUserCode;

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
