// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
/****
 * @namespace utils/uri
 * Enseble de fonctions utiles pour la manipulation des url
 */
 import extendObj from "../extendObj";
 import defaultStr from "../defaultStr";
 import  "../extend.prototypes";
import "$active-platform/uri/polyfill";
 const queryString = require('qs');
 /****
  * retourne les paramètres GET passé à une url, paramètre situé après le ? de l'url
  */
 export const getQueryString = (uri,addSepartor) =>{
     if(typeof uri !=="string") return uri;
     let parse = parseURI(uri);
     uri = typeof parse.search ==="string" ? parse.search : "";
     if(addSepartor && uri){
         return "?"+uri.ltrim("?");
     } else {
         uri = uri.trim().ltrim("?").rtrim("?");
     }
     return uri;
 }
 /**** 
  * retourne la liste des paramètres GET liée à une url
  * @param {string} l'url en quesiton
  * @param {queryStringOpts}, @voir : https://github.com/ljharb/qs
  * @return {object}
  */
 export const getQueryParams = function(uri,queryStringOpts){
     if(typeof uri !=='string') return {};
     return queryString.parse(getQueryString(uri,false),queryStringOpts);
 }
 
 /**** supprimer les queryString des paramètres et ne laisser que l'url */
 export const removeQueryString = function(uri,_decodeURIComponent){
     if(typeof uri !=="string") return "";
     uri = uri.replace(/#.*$/, '').replace(/\?.*$/, '');
     if(_decodeURIComponent ===true){
         return decodeURIComponent(uri);
     }
     return uri;
 }
 
 /**** ajoute les paramètres GET à l'url passée en paramètre
  * @param url {string} l'url en question
  * @param key {string|object} clé ou ensemble clé-valeur à ajouter
  * @param value {any} valeur associé à la clé à ajouter, valable lorsque key est de type string
  *      si key est de type object alors options( https://github.com/ljharb/qs peut être value
  * @param options{object} : voir  https://github.com/ljharb/qs
 */
 export function setQueryParams(url,key, value,options) {
     if(typeof url !=="string" || !url) return url;
     let params = getQueryParams(url);
     url = removeQueryString(url);
     if(typeof key ==="object"){
         if(!key) key = {};
         options = typeof options =="object" && options ? options : typeof value =="object" && value ? value : {};
     } else if(typeof key =="string"){
         key = {[key]:value};
     }
     return url+"?"+queryString.stringify(extendObj(true,{},params,key),options);
 }
 
 /*** converti un objet en une chaine de caractère queryString */
 export function objectToQueryString(o,encodeURI)  {
     if(o == null || typeof o !== 'object') return "";
     function iter(o, path) {
         if (Array.isArray(o)) {
             o.forEach(function (a) {
                 iter(a, path + '[]');
             });
             return;
         }
         if (o !== null && typeof o === 'object') {
             Object.keys(o).forEach(function (k) {
                 iter(o[k], path + '[' + k + ']');
             });
             return;
         }
         data.push((encodeURI?encodeURIComponent(path):path) + '=' + (encodeURI ? encodeURIComponent(o):o));
     }
 
     var data = [];
     Object.keys(o).forEach(function (k) {
         iter(o[k], k);
     });
     return data.join('&');
 }
 export function ObjToQueryString (o){
     return objectToQueryString(o);
 }
 export const isValidUrl = (str)=>{
     return /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/.test(str);
 };
 
 
 Object.toURIQueryString = ObjToQueryString;
 
 export const isValidURL = isValidUrl;
 
 
 export function getCurrentURI (){
     let uri = getURIPathName()
     if(uri){
         return uri;
     }
     return "";
 }
 
 
 export const parseURI = (uri)=>{
     if(typeof uri !=="string") return {};
     var m = uri.match(/^(([^:\/?#]+:)?(?:\/\/((?:([^\/?#:]*):([^\/?#:]*)@)?([^\/?#:]*)(?::([^\/?#:]*))?)))?([^?#]*)(\?[^#]*)?(#.*)?$/);
     let r = !m ? {} : {
         hash: m[10] || "",                   // #asd
         host: m[3] || "",                    // localhost:257
         hostname: m[6] || "",                // localhost
         href: m[0] || "",                    // http://username:password@localhost:257/deploy/?asd=asd#asd
         origin: m[1] || "",                  // http://username:password@localhost:257
         pathname: m[8] || (m[1] ? "/" : ""), // /deploy/
         port: m[7] || "",                    // 257
         protocol: m[2] || "",                // http:
         search: m[9] || "",                  // ?asd=asd
         username: m[4] || "",                // username
         password: m[5] || ""                 // password
     };
     if (r.protocol && r.protocol.length == 2) {
         r.protocol = "file:///" + r.protocol.toUpperCase();
         r.origin = r.protocol + "//" + r.host;
     }
     if(r.protocol){
         r.href = r.origin + r.pathname + r.search + r.hash;
     }
     return r;
 }
 
 export const getURIPathName = (uri,useCurrentURI)=>{
     uri = defaultStr(uri,useCurrentURI !==false && typeof window !=="undefined" && window && window.location? window.location.href: "")
     const parsedURI = parseURI(uri);
     return typeof parsedURI.pathname =="string" ? parsedURI.pathname : "";
 }
 
 /**** 
  * construit une route/url (url) à partir des paramtères pris dynamiquement 
  * @param {...({string|object})} - les paramètres devant figurer dans la route à construire
  * exemple : buildUrl ("app","route","final","settings",{test=2,t1=3}) => appp/route/final/settings?test=2&t1=3
  * @return {string} url construite à partir des paramètres pris dynamiquement
  */
  export const buildUrl = function  (){
     const args = Array.prototype.slice.call(arguments,0);
     let path = "", params = {};
     args.map((p,i)=>{
         if(p){
             if(typeof p =="string"){
                 path = path.rtrim("/");
                 path +=(path ? "/":"");
                 path = path+(removeQueryString(p).ltrim(path)).ltrim("/");
             } else if(typeof p =="object" && !Array.isArray(p)){
                 params = {...params,...p};
             }
         }
     })
     params = params && typeof params =="object" ? params : {};
     params = {...getQueryParams(path),...params};
     let qs = queryString.stringify(params);
     path = path ? path : "";
     path = path.split("?")[0].trim().ltrim("/");
     if (qs.length > 0){
         qs = qs.trim().ltrim("?"); //chop off last "&"
         path = path + "?" + qs;
     }
     return path;
 }
 export default queryString;
 
 export {queryString};