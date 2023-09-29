// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
/*** @namespace api/fetch
 * Ensemble des fonctions utiles pour l'exécution des requêtes distantes (ajax)
 */
import originalFetch from "./unfetch";
import { buildAPIPath} from "./utils";
import { isObj,defaultNumber,isNonNullString,defaultObj,extendObj,isValidURL,defaultStr} from "$cutils";
import {NOT_SIGNED_IN,SUCCESS,CREATED,ACCEPTED} from "./status";
import notify from "$active-platform/notify";
import {getToken} from "$cauth/utils";
import APP from "$capp/instance";
import {timeout,canCheckOnline} from "./utils";
import {isClientSide} from "$cplatform";
import appConfig from "$capp/config";
import i18n from "$i18n";

export  function setCodeVerifierHeader(verifier) {
  codeVerifier = verifier;
}
export const getRequestHeaderKey = x=>{
  return appConfig.prefixWithAppId(x);
}
/**** recupère l'ensemble des entêtes par défaut à ajouter au header de la requête. 
 * @namespace api/fetch
 * Par défaut, l'entête Authorization Baerer est ajoutée à l'entête de la requête, lorsqu'il existe un token valide
 * @param {{headers : {object}}} opts - les options de la requêtes
 * @return {{headers}} : l'entête directement exploitable pour l'exécution de la méthode fetch ({@link fetch})
 */
export const getRequestHeaders = function (opts){
    opts = typeof opts !=="object" || Array.isArray(opts) || !opts ? {} : opts;
    let customRequestHeader = null;
    const ret = extendObj({},opts.headers,customRequestHeader);
    if(!ret.Authorization  && !ret.authorization && opts.authorization !== false && opts.Authorization !== false){
       const token = getToken();
       if(token){
           ret.Authorization = "Bearer "+token;
       }
    }
    return ret;
}

/**** exécute une requête ajax distante
 * @namaspace api/fetch
 * @typedef {{url:string,path:string,fetcher:function,checkOnline:bool}} fetchOptions
 * avec : fetchOptions est de la forme : {
 *    path : {string}: le chemin de l'api qu'on veut préfixer,
 *    url : {string} : alias à path
 *    fetcher : {function} : la fonction de récupération des données distante. par défaut, (url)=>fetch(url); ou fetch est par défaut importé du package 'unfetch'
 *    queryParams : {object} : les paramètres queryString à passer à la fonction buildAPIPath, {@link buildAPIPath}
 * }
 * @param {(string|fetchOptions)} url, 
 *    - s'il s'agit d'une chaine de caractère, alors url repésente l'url absolue où relative à via laquelle la requête fetch doit être exécutée
 *    - s'il s'agit d'un objet, alors url est subsitué au paramètre options et l'une des propriétés path où url de cet objet est utilisé pour l'exécution de la requête fetch
 * @param {fetchOptions}, les options supplémentaires à passer à la fonction fetch
 */
export default function fetch (url, options = {}) {
  const {fetcher,url:u,path,...opts} = getFetcherOptions(url,options);
  return fetcher(u, opts);
};
/***@function
 * @namespace api/fetch
 *  function permettant d'exécuter la requête ajax de type GET 
 * les paramètres sont identiques à ceux de la function {@link fetch} à la seule différence que 
 * la méthode utilisée (props method des options) est GET
 */
export const get = fetch;
/***@function 
 * function permettant d'exécuter la requête ajax POST, les paramètres sont identiques à ceux de la function {@link fetch} à la seule différence que 
 * la méthode utilisée (props method des options) est POST
 */
export const post = (url, options = {})=> {
  options = defaultObj(options);
  options.method = 'POST';
  return fetch(url,options);
};

export const put = (url, options = {})=> {
  options = defaultObj(options);
  options.method = 'PUT';
  return fetch(url,options);
};

const deleteApi = (url, options = {})=> {
  options = defaultObj(options);
  options.method = 'delete';
  return fetch(url,options);
};

export {deleteApi as delete};

/**** 
 *   permet de traiter le resultat d'une requête ajax effectuée via la méthode {@link fetch}
 *   
 *   Si le résultat issue de l'api est un objet, alors cet objet est décomposé dans la réponse à retourner à l'utilisateur
 *   Si le résultat issue de l'api n'est pas un objet, alors celui-ci est transmis dans la variable data qui résolvra la promessage * 
 */
export const handleFetchResult = ({fetchResult:res,showError,json,handleError,isAuth,redirectWhenNoSignin}) =>{
   return new Promise((resolve,reject)=>{
      const contentType = defaultStr(res.headers.get("Content-Type"),res.headers.get("content-type")).toLowerCase();
      const isJson = contentType.contains("application/json");
      const cb = (d)=>{
        d = isJson ?  (!isObj(d)? {data:d,result:d} : d) : d;
        const response = {};
        if(res && typeof res !=='boolean' && typeof res !='string'){
           ['ok','status','statusText','error','headers'].map((v)=>{
              response[v] = res[v];
            });
        }
        response.status = response.status || res?.status;
        response.success = response.status === SUCCESS || response.status === CREATED || response.status === ACCEPTED ? true : false;
        if(!isJson && !isObj(d)){
           d = {};
        }
        d.response = response;
        d.fetchResponse = res;
        d.parsed = isJson;
        d.res = res;
        if(d.error && typeof d.error =='string'){
             d.message = response.message = response.msg = d.error;
        }
        if(response.success){
           return resolve(d)
        }
        return handleFetchError({isAuth,...d,response,showError,handleError,redirectWhenNoSignin}).catch(reject);
       };
      return json !== false && isJson ? res.json().then(cb).catch(reject) : resolve(cb(res));
   })
 }
export const handleFetchError = (opts)=>{
  let {showError,isAuth,reject,redirectWhenNoSignin,error,response,...rest} = defaultObj(opts);
  response = defaultObj(response);
  rest.error = error;
  const isClient = typeof window !='undefined' && window;
  const errorM = typeof error =='object' && error ? defaultStr(error.message,error.ExceptionMessage,error.Message,error.MessageDetail,error.msg) : null;
  let message = defaultStr(response.message,response.msg,error,errorM,rest.message);
  if(!message && error && typeof error =='object'){
      let eM = defaultStr(error.message,error.msg);
      let sep = "";
      if(!eM){
         const errors = Array.isArray(error.errors) && error.errors.length ? error.errors : Array.isArray(error.messages) && error.messages.length ? error.messages : 
            Array.isArray(rest.errors) && rest.errors.length ? rest.errors :  [];
         errors.map((e)=>{
            let ee = undefined;
            console.log(e," found fetch error ",e?.message,e?.code);
            if(e && (e.message || e.msg || e.code)){
               ee = defaultStr(e.message,e.msg);
               if(isNonNullString(e.code) || typeof e.code ==='number'){
                  ee = "[{0}] {1}".sprintf(e.code+"",ee);
               }
            } else if(isNonNullString(e)){
               ee = e;
            }
            if(ee){
               eM+=(sep+ee);
               sep = ", ";
            }
         });
      }
      if(eM){
         message = eM;
      }
      if(!message && isClient){
         const isXMLHttpRequest = defaultStr(Object.prototype.toString.call(error.target)).contains("XMLHttpRequest");
         if(isXMLHttpRequest && error.target.status === 0){
            message = defaultStr(error.message,error.msg,i18n.lang("server_not_reachable"));
         }
      }
  }
  response.message = rest.message = message;
  if(showError !== false && isClient){
     if(message){
       notify.error({...response,position:'top'});
     }
  }
  rest.response = response;
  rest.status = response.status || error && typeof error !='boolean' && error?.status;
  rest.userNotSignedIn = rest.notSignedIn = response.notSignedIn = response.userNotSignedIn = response.status === NOT_SIGNED_IN ? true : false;
  if(isClient && isAuth !== true && response.userNotSignedIn && redirectWhenNoSignin !== false){
     const hasMessage = defaultStr(response.message,response.msg)? true : false;
     Auth.signOut2Redirect(!hasMessage);
  }
  throw(rest);
}

/*** le mutator permet de modifier les options de la recherche dynamiquement 
 * ajout de la props fetchOptionsMutator : permettant d'être en mesure de muter les fetchOptions de la requête envoie l'envoie vers le serveur
 * si la fonction fetchOptionsMutator retourne un objet contenant la props url valide alors c'est cet url qui sera utilisée pour effectuer la requête fetch    
   la fonction fetchOptionsMutator, lorsqu'elle retourne un objet, les propriétés dudit objet permettent d'override les propriétés à passer à la fonction handleFetchResult
*/
export function getFetcherOptions (opts,options){
    if(opts && typeof opts =="string"){
        opts = {path:opts};
     }
     opts = extendObj(true,{},opts,options);
     let {path,url,fetcher,auth,isAuth,includeCredentials,queryParams,mutator,fetchOptionsMutator,offlineMode,onlineMode,checkOnline} = opts;
     isAuth = isAuth || auth;
     url = defaultStr(url,path);
     queryParams = Object.assign({},queryParams);
     const fetcher2 = typeof (fetcher) ==='function' ? fetcher : (url,opts2) => {
         return originalFetch(url,opts2)
            .then(res=>handleFetchResult({...opts,fetchResult:res}))
            .catch((error)=>{
               return handleFetchError({...opts,error});
         });
     }
     opts.fetcher = (url,opts2)=>{
        const delay = defaultNumber(opts.delay,opts.timeout);
        const canRunOffline = onlineMode === false || offlineMode === true && true || false;
        const p = (!canRunOffline && isClientSide() && (checkOnline === true || canCheckOnline) && !APP.isOnline())? 
              APP.checkOnline().then(()=>{
                 return fetcher2(url,opts2);
              }) : fetcher2(url,opts2);

        return timeout(p,delay).catch((error)=>{
           return handleFetchError({...opts,error})
        });
     }
     opts.queryParams = queryParams;
     const method = defaultStr(opts.method,"get").toLowerCase();
     if((method ==='get' | method =='post') && (isObj(opts.fetchOptions))){
         if(method =='get'){
            opts.queryParams.fetchOptions = extendObj(true,{},opts.fetchOptions,opts.queryParams.fetchOptions);
         } else {
            opts.body = defaultObj(opts.body);
            opts.body.fetchOptions = extendObj(true,{},opts.fetchOptions,opts.body.fetchOptions);
         }
     }
     if(typeof mutator =='function'){
        mutator(opts)
     }
     const requestHeaders = getRequestHeaders(opts);
     opts.headers = extendObj({},opts.headers,requestHeaders)
     opts.url = buildAPIPath(url,opts.queryParams);
     ///includeCredentialsOnApiFetch doit être définit pour l'inclusion automatique des crédentials aux entête des apiFetch
     if(includeCredentials !== false && appConfig.get("includeCredentialsOnApiFetch") !== false && (opts.headers.Authorization || opts.headers.authorization)){
        opts.credentials = "include";
     }
     const hasContentType = "Content-Type" in opts.headers || "content-type" in opts.headers || "Content-type" in opts.headers || "content-Type" in opts.headers;
     if(isObj(opts.body)){
        if(!hasContentType){
           opts.headers["Content-Type"] = "application/json";
           opts.headers["Accept"] = "application/json";
        }
        opts.body  = JSON.stringify(opts.body);
     } else if(!opts.body && !hasContentType){
        opts.headers["Content-Type"] = "text/plain";
     }
     delete opts.authorization;
     delete opts.Authorization;
     return opts;
}

export const getFetcher = getFetcherOptions;

export const getFetchOptions = getFetcher;

