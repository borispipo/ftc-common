// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import $session from "$session";
import {isObj,extendObj,isNonNullString,defaultStr,defaultObj} from "$cutils";
import APP from "$capp/instance";
import {updateTheme as uTheme} from "$theme";
import { getThemeData } from "$theme/utils";
import theme,{defaultDarkTheme,defaultLightTheme} from "$theme";

export const USER_SESSION_KEY = "user-session";

export const TOKEN_SESSION_KEY = "user-token-key";

export const getToken = (key)=>{
    const token = $session.get(TOKEN_SESSION_KEY) || null;
    return isObj(token) && isNonNullString(key)? token[key] : token;
  }
  export const setToken = (token)=>{
     return $session.set(TOKEN_SESSION_KEY,token);
  }
  export const isValidToken = (token)=>{
     return isObj(token) && isNonNullString(token.userId) && isNonNullString(token.token)? true : false;
  }
  export const hasToken = ()=>{
    const token = getToken();
    return isValidToken(token);
  }

  export const isLoggedIn = x => {
    const u = getLocalUser();
    return isObj(u) && (hasToken() || isNonNullString(u.code))  ? true : false;
  }
  
export const getLocalUser = x=> {
    const u = $session.get(USER_SESSION_KEY);
    return isObj(u)  && (hasToken() || isNonNullString(u.code)) ? u : null;
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

export const setLocalUser = u => $session.set(USER_SESSION_KEY,u || null);

export const DEFAULT_SESSION_NAME = "USER-DEFAULT-SESSION";

export const getSessionKey = (sessionName)=>{
  sessionName = defaultStr(sessionName,DEFAULT_SESSION_NAME);
  const userCode = getLoggedUserCode();
  if(!isNonNullString(userCode)) return false;
  return sessionName+"-"+userCode;
}

export const getSessionData = (sessionKey,sessionName)=>{
  const key = getSessionKey(sessionName);
  const dat = isNonNullString(key)? defaultObj($session.get(key)) : {};
  if(isNonNullString(sessionKey)){
      return dat[sessionKey]
  }
  return dat;
}

export const setSessionData = (sessionKey,sessionValue,sessionName)=>{
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
    updateTheme(theme.dark?defaultDarkTheme:defaultLightTheme);
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
