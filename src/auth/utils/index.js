import {isObj,defaultStr} from "$cutils";
import notify from "$active-platform/notify";
import {encrypt,decrypt} from "$crypto";
import { SIGN_IN} from "../routes";
import {getURIPathName} from "$cutils/uri";
import {NOT_SIGNED_IN} from "$capi/status";

export * from "./session";
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