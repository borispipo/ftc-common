// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
/*** @namespace api/fetch
 * Ensemble des fonctions utiles pour l'exécution des requêtes distantes (ajax)
 */
 import originalFetch from "unfetch";
 import { buildAPIPath} from "./utils";
 import {isWeb} from "$cplatform";
 import { isObj,defaultNumber,defaultObj,extendObj,defaultStr} from "$cutils";
 import {NOT_SIGNED_IN,SUCCESS} from "./status";
 import notify from "$active-platform/notify";
 import {getToken} from "$cauth/utils";
 import APP from "$capp/instance";
 import {timeout,canCheckOnline} from "./utils";
 import {isClientSide} from "$cplatform";
 import appConfig from "$capp/config";
 import apiC from "$apiCustom";

 const apiCustom = isObj(apiC)? apiC : {};

 export {apiCustom};
 
 
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
     if(typeof apiCustom.getRequestHeaders =='function'){
         customRequestHeader = apiCustom.getRequestHeaders(opts);
     }
     const ret = {...defaultObj(customRequestHeader)};
     if(!ret.Authorization){
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
   const {fetcher,checkOnline,url:u,path,...opts} = getFetcherOptions(url,options);
   const cb = ()=>{
     return timeout(fetcher(u, opts),defaultNumber(opts.delay,opts.timeout))
   }
   if(isClientSide() && (checkOnline === true || canCheckOnline) && !APP.isOnline()){
       return APP.checkOnline().then((state)=>{
          return cb();
       });
   }
   return cb();
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
 
 
 /**** permet de traiter le resultat d'une requête ajax effectuée via la méthode {@link fetch} */
 export const handleFetchResult = ({fetchResult:res,showError,json,isAuth,redirectWhenNoSignin}) =>{
    return new Promise((resolve,reject)=>{
       return json !== false ? res.json().then((d)=>{
          const response = {};
          ['ok','status','statusText','error','headers'].map((v)=>{
            response[v] = res[v];
          });
          response.success = response.status === SUCCESS ? true : false;
          const a =  {response,...d};
          if(d.error && typeof d.error =='string'){
               a.message = response.message = response.msg = d.error;
          }
          if(typeof apiCustom.handleFetchResult =='function' && apiCustom.handleFetchResult({...a,resolve,reject})== false) return;
          if(response.success){
             return resolve(a)
          }
          if(showError !== false){
             const message = defaultStr(response.message,response.msg);
             if(message){
               notify.error({...response,position:'top'});
             }
          }
          if(isAuth !== true && response.status === NOT_SIGNED_IN && redirectWhenNoSignin !== false){
             const hasMessage = defaultStr(response.message,response.msg)? true : false;
             Auth.signOut2Redirect(!hasMessage);
          }
          reject(a);
       }).catch(reject) : resolve(res);
    })
  }
 
 /*** le mutator permet de modifier les options de la recherche dynamiquement */
 export function getFetcherOptions (opts,options){
     if(opts && typeof opts =="string"){
         opts = {path:opts};
      }
      opts = extendObj(true,{},opts,options);
      let {path,url,fetcher,auth,isAuth,showError,json,redirectWhenNoSignin,queryParams,mutator,...rest} = opts;
      isAuth = isAuth || auth;
      url = defaultStr(url,path);
      queryParams = Object.assign({},queryParams);
      fetcher = typeof (fetcher) ==='function' ? fetcher : (url,opts2) => {
        return originalFetch(url,opts2).then(res=>handleFetchResult({...opts,fetchResult:res}));
      }
      if(defaultStr(opts.method).toLowerCase() =='post'){
         opts.body = defaultObj(opts.body);
         opts.body = {...defaultObj(rest),...opts.body};
         delete opts.body.body;
         delete opts.body.method;
      }
      opts.queryParams = queryParams;
      if(typeof mutator =='function'){
         mutator(opts)
      }
      const requestHeaders = getRequestHeaders();
      opts.headers = extendObj({},opts.headers,requestHeaders)
      opts.url = buildAPIPath(url,opts.queryParams);
      opts.fetcher = fetcher;
      if(opts.headers.Authorization || opts.headers.authorization){
         opts.credentials = "include";
      }
      /** personnaliser la fonction getFetcherOptions */
      if(typeof apiCustom.getFetcherOptions =='function'){
         extendObj(opts,apiCustom.getFetcherOptions(opts))
      }
      if(isObj(opts.body)){
         opts.headers["Content-Type"] = "application/json";
         opts.headers["Accept"] = "application/json";
         opts.body  = JSON.stringify(opts.body);
      } else if(!opts.body){
         opts.headers["Content-Type"] = "text/plain";
      }
      return opts;
 }
 
 export const getFetcher = getFetcherOptions;
 
 