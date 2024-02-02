// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import notify from "$active-platform/notify";
import {encrypt,decrypt} from "$crypto";
import { SIGN_IN} from "../routes";
import {getURIPathName} from "$cutils/uri";
import {NOT_SIGNED_IN} from "$capi/status";
import {defaultObj,extendObj,isNonNullString,isObj,defaultStr} from "$cutils";
import appConfig from "$capp/config";
import crypToJS from "$clib/crypto-js";
import {parseJSON} from "$cutils/json";
import {isClientSide} from "$cplatform";
import $session from "$session";
import {updateTheme as uTheme} from "$theme";
import { getThemeData } from "$theme/utils";
import APP from "$capp/instance";
import DateLib from "$clib/date";


export const permProfilesTableName = "PERMS_PROFILES";

export const notAllowedMsg = "Vous n'êtes pas autorisé à accéder à la ressource demandée";

export const decryptPassword = (pass,userCode)=>{
    if(isObj(pass)){
        userCode = defaultStr(userCode,pass.code)
        pass = pass.pass;
    }
    userCode = defaultStr(userCode).toUpperCase().trim();
    return decrypt(pass,userCode) 
};

export const encryptPassword = (pass,userCode)=>{
    if(isObj(pass)){
        userCode = defaultStr(userCode,pass.code)
        pass = pass.pass;
    }
    userCode = defaultStr(userCode).toUpperCase().trim();
    return encrypt(pass,userCode) 
}

/*** affiche un message d'erreur passé en paramètre */
export const showError = (errorMsg)=>{
    errorMsg = defaultStr(errorMsg,notAllowedMsg);
    notify.error(errorMsg);
}


export const NOT_SIGNED_IN_MESSAGE = "Utilisateur non connecté!!\nMerci de tout d'abord faire connecter l'utilisateur";

export const NOT_SIGNED_IN_API_PATH = "/api/not-signed-in";

export const isSignInPage = (route)=>{
  route = getURIPathName(route).ltrim("/").trim().toLowerCase();
  return route.startsWith(SIGN_IN.ltrim("/").rtrim("/")) ? true : false;
}

/*** retourne le résultat de requête mentionnant l'utilisateur non connecté, lorsqu'il s'agit d'un appel à l'api
 * @param {object} res : l'objet response à utiliser pour retourner le resultat à l'utilisateur
 * @return {boolean|object} 
 */
export const handleNotSignedInApiResponse = (res)=>{
  if(res && typeof res=='object' && typeof res.status =='function' && typeof res.json =='function'){
    return res.status(NOT_SIGNED_IN).json({message:NOT_SIGNED_IN_MESSAGE});
  }
  return false;
}


export const tableDataPerms = {};
export const structDataPerms = {};

export const defaultPermsActions = ['read','create','write','update','edit','delete','remove'];

const localUserRef = {current:null};

const signInRef = {};

const USER_SESSION_KEY = "user-session";

export const TOKEN_SESSION_KEY = "user-token-key";

export const getEncryptKey = x=>defaultStr(appConfig.get("authSessionEncryptKey"),process.env.AUTH_SESSION_ENCRYPT_KEY,"auth-decrypted-key");

export const isValidLoginId = (loginId)=> isNonNullString(loginId) || typeof loginId ==='number';

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

export const canSignOut = ()=>{
    if(!isClientSide() || isSingleUserAllowed()) return false;
    return true;
}

export const canLogout = canSignOut;

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


const maxProcessSessionAge = parseFloat(process.env.AUTH_SESSION_MAX_AGE||'') || 0;
//par défaut les sessions utilisateur expirent après 3 jours
export const getAuthSessionMaxAge = ()=>{
  const maxAgeConfig = appConfig.get("authMaxSessionAge");
  if(typeof maxAgeConfig =='number' && maxAgeConfig > 1000) return maxAgeConfig;
  return typeof maxProcessSessionAge =="number" && maxProcessSessionAge > 1000 ? maxProcessSessionAge : 3* 60 * 60 * 24  // 3 days
}


export const getLocalUser = x=> {
    if(!isClientSide()) return null;
    if(isValidUser(localUserRef.current)) return localUserRef.current;
    const encrypted = $session.get(USER_SESSION_KEY);
    const defaultUser = getDefaultSingleUser();
    if(isNonNullString(encrypted)){
      try {
        const ded = crypToJS.decode(encrypted,getEncryptKey());
        if(isObj(ded) && typeof ded?.toString =='function'){
          const decoded = ded.toString(crypToJS.enc.Utf8);
          const u = parseJSON(decoded);
          if(isValidUser(u)){
            const {authSessionCreatedAt} = u;
            if(authSessionCreatedAt && !isSingleUserAllowed()){
              const d = new Date(authSessionCreatedAt);
              if(DateLib.isValid(d)){
                const expiresAt = authSessionCreatedAt + getAuthSessionMaxAge() * 1000;
                if (Date.now() > expiresAt) {
                   setLocalUser(null); //la session utilisateur a expirée, on la supprime
                   throw new Error(`Session utilisateur expirée pour l'utilisateur`);
                }
              }
            }
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

export const updateTheme = (u)=>{
    if(!isObj(u)){
        u = getLoggedUser();
    }
    if(isObj(u) && isObj(u.theme) && u.theme.name && u.theme.primary){
        uTheme(getThemeData(u.theme).theme);
    }
}

export const setLocalUser = u => {
  if(!isClientSide()) return null;
  const uToSave = isValidUser(u)? u : null;
  localUserRef.current = uToSave;
  let encrypted = null;
  try {
    if(isObj(uToSave)){
      uToSave.authSessionCreatedAt = new Date();
    }
    encrypted = uToSave ? crypToJS.encode(JSON.stringify(uToSave)).toString() : null;
  } catch(e){
    localUserRef.current = null;
    console.log(e," setting local user");
  }
  return $session.set(USER_SESSION_KEY,encrypted)
}

export const isLoggedIn = x => {
    const u = getLocalUser();
    return isValidUser(u)  ? true : false;
}

export const isSignedIn = isLoggedIn;
  
export const isValidUser = u=> {
    if(!isObj(u) || !Object.size(u,true)) {
      return false;
    }
    return !!(hasToken() || String(getLoginId(u,false)));
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

const hasMethod = function(methodName){
  if(!isNonNullString(methodName)) return false;
  return typeof signInRef[methodName] === "function";
};
/**** SignIn2Signout est étendue avec le composant AuthProvider*/
const SignIn2SignOut = {
  get hasMethod(){
    return hasMethod;
  },
  get getMethod (){
      return (methodName)=>{
        if(hasMethod(methodName)){
          return signInRef[methodName];
        }
        return undefined;
      }
  },
  get callMethod (){
    return (methodName,...args)=>{
        const method = this.getMethod(methodName);
        if(method){
            return method(...args);
        }
        return undefined;
    }
  },
  /**** vérifie si l'utilisateur est le master admin
    @param {object}, l'utilisateur
    @parma {booleans}, si l'objet vide est passé alors il sera remplacé par l'utilisateur connecté s'il est vide à moins que cet options ne passe à false
  */
  get isMasterAdmin(){
    return (user,pickDefaultUser)=>{
        if(isSingleUserAllowed()){
          return !!getDefaultSingleUser();
        }
        if(pickDefaultUser !== false){
          user = defaultObj(user,getLoggedUser());
        } else {
          user = isObj(user)? user : defaultObj(getLoggedUser());
        }
        if(hasMethod("isMasterAdmin")){
            return signInRef.isMasterAdmin(user,pickDefaultUser);
        }
        throw "isMasterAdminFunction is not defined on AuthProvider. set IsMasterAdmin callback on AuthProvider";
    }
  },
  get upsertUser1(){
    return (...a)=>{
        if(hasMethod("upsertUser")){
            return signInRef.upsertUser(...a);
        }
        throw "upsertUser function is not defined on AuthProvider. set IsMasterAdmin callback on AuthProvider";
    }
  },
  get signIn1(){
     return (...p)=>{
        if(hasMethod("signIn")){
            return signInRef.signIn(...p); 
         }
     }
  },
  /***** recupère le nom de la resource table data à partir de la tableName passée en paramètre 
    @param {string} tableName, le nom de la table,
    @return {string}, le nom de la resource obtenue à partir de la table
  */
  get tableDataPermResourcePrefix(){
      return (tableName,...rest)=>{
        if(hasMethod("getTableDataPermResourcePrefix")){
            return defaultStr(this.getTableDataPermResource(tableName,...rest));
        }
        return tableName.trim().toLowerCase();
      }
  },
  get structDataPermResourcePrefix(){
    return (tableName,...rest)=>{
      if(hasMethod("getStructDataPermResourcePrefix")){
          return defaultStr(this.getTableDataPermResource(tableName,...rest));
      }
      return tableName.trim().toLowerCase();
    }
  },
  get signOut1(){
    return (...p)=>{
       if(hasMethod("signOut")){
           return Promise.resolve(signInRef.signOut(...p)).then((d)=>{
              logout();
              return d;
           }); 
       }
       return Promise.resolve(logout());
    }
  },
  /**** permet de définir les références vers les fonctions de déconnexion et de connexion à l'application*/
  get setRef (){
    return (currentSigninRef)=>{
      extendObj(signInRef,currentSigninRef);
      return signInRef;
    }
  },
  get getRef(){
    return ()=> signInRef;
  },
  get getUserProp(){
    return (user,propsName,methodName,force)=>{
      if(!isObj(user) && force !== false){
        user = getLocalUser();
      }
      user = defaultObj(user);
      if(hasMethod(methodName)){
          return signInRef[methodName](user,propsName,methodName);
      }
      if(hasMethod("getUserProp")){
          return signInRef.getUserProp(user,propsName,methodName);
      }
      return user[propsName];
    }
  }
}

/*** retourne le username de l'utilsateur passé en paramètre */
export const getUserName = (user)=>{
   return SignIn2SignOut.getUserProp(user,"userName","getUserName");
}
/*** retourne le pseudo de l'utilisateur passé en paramètre */
export const getUserPseudo = (user)=>{
  return SignIn2SignOut.getUserProp(user,"pseudo","getUserPseudo");
}

export const getUserFirstName = (user)=>{
  return SignIn2SignOut.getUserProp(user,"firstName","getUserFirstName");
}

export const getUserLastName = (user)=>{
  return SignIn2SignOut.getUserProp(user,"lastName","getUserLastName");
}

export const getUserFullName = (user)=>{
  const fullName = SignIn2SignOut.getUserProp(user,"fullName","getUserFullName");
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
  return SignIn2SignOut.getUserProp(user,"email","getUserEmail");
}
export const getUserCode = (user,force)=>{
  return SignIn2SignOut.getUserProp(user,"code","getUserCode",force);
}

export const getLoginId = (user,force)=>{
  const v = SignIn2SignOut.getUserProp(user,"loginId","getLoginId",force);
  if(isValidLoginId(v)) return v;
  return getUserCode(user,force);
}


export const getTableDataPermResourcePrefix = (tableName,...rest)=>{
  return SignIn2SignOut.tableDataPermResourcePrefix(defaultStr(tableName).trim().ltrim("/"),...rest);
}

export const getStructDataPermResourcePrefix = (tableName,...rest)=>{
  return SignIn2SignOut.structDataPermResourcePrefix(defaultStr(tableName).trim().ltrim("/"),...rest);
}

export const getLoggedUserCode = (data)=>{
  return getUserCode((isObj(data) && data || getLocalUser()))
}

export const DEFAULT_SESSION_NAME = "USER-DEFAULT-SESSION";

export const getSessionKey = (sessionName)=>{
  sessionName = defaultStr(sessionName,DEFAULT_SESSION_NAME);
  const userCode = getLoginId();
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
      extendObj(dat,sessionKey,sessionValue);
  } else {
      return dat;
  }
  $session.set(key,dat);
  return dat;
}

/*** déconnecte l'utilisateur actuel */
export const logout = () =>{
    if(!canSignOut()) return null;
    setLocalUser(null);
    resetPerms();
    APP.trigger(APP.EVENTS.AUTH_LOGOUT_USER);
    return true;
}

/*** 
 *  - on peut définir la liste des noms de tables data dans le propriété tables|tableNames de appConfig.tablesData
 *  - on peut définir la liste des noms struct data dans la propriété structData | structDataTableNames de appConfig.structsData
 *  
 */

export const resetPerms = ()=>{
  const allPerms = {};
  Object.map(tableDataPerms,(v,i)=>{
      delete tableDataPerms[i];
  })
  Object.map(structDataPerms,(v,i)=>{
      delete structDataPerms[i];
  })
  const action = defaultPermsActions;
  Object.map(appConfig.tablesData,(table,tableName)=>{
      tableName = defaultStr(isObj(table) && (table.tableName || table.table),tableName)
      if(!(tableName)) return null;
      tableName = tableName.toLowerCase().trim();
      const resource = getTableDataPermResourcePrefix(tableName).trim().rtrim("/");
      tableDataPerms[tableName] = Auth.isAllowed({resource,action});
  })
  Object.map(appConfig.structsData,(table,tableName)=>{
      tableName = defaultStr(isObj(table) && (table.tableName || table.table),tableName)
      if(!(tableName)) return null;
      tableName = tableName.toLowerCase().trim();
      const resource = getStructDataPermResourcePrefix(tableName).trim().rtrim("/");
      structDataPerms[tableName] = Auth.isAllowed({resource,action});
  })
  allPerms.tableDataPerms = tableDataPerms;
  allPerms.structDataPerms = structDataPerms;
  return allPerms;
}

export const disableAuth = ()=>{
  appConfig.set("isAuthSingleUserAllowed",true);
  appConfig.set("authDefaultUser",{code:"root",password:"admin123",label:"Master admin"});
  resetPerms();
  return true;
}

export const enableAuth = ()=>{
  appConfig.set("isAuthSingleUserAllowed",false);
  appConfig.set("authDefaultUser",null);
  resetPerms();
  return true;
}

export function login (user,trigger){
  if(typeof user =='boolean'){
      trigger = user;
      user = trigger;
  }
  if(!isObj(user)){
      user = getLoggedUser();
  }
  try {
      if(isValidUser(user)){
          setLocalUser(user);
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

export const loginUser = login;

export default SignIn2SignOut;