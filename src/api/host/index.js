// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
/***@namespace api/host */
import {buildUrl,isValidURL} from "$cutils/uri";
import "$cutils/string";
import defaultStr from "$cutils/defaultStr";
import appConfig from "$capp/config";

/*** retourne l'url locale à l'application
 * @function
 * @return {string} - l'url locale à l'application
 */
export const getLocalHost =  () =>{
    if(typeof window !=='undefined' && window && window?.location){
        const port = window.location.port;
        return window.location.protocol + '//' + window.location.hostname+(port?(":"+port):"");
    }
    return undefined;
}

/**** retourne l'url de base utile pour les requêtes vers l'api
 * @return {string} l'url racine pour les requêtes vers l'api
 */
export const getBaseHost = x=>{
    return isValidURL(appConfig.API_HOST)? appConfig.API_HOST : isValidURL(process.env.API_HOST)? process.env.API_HOST : defaultStr(getLocalHost())
}

/****
 * la version de l'api, cette variable peut être issue de la propriété API_VERSION des variables d'environnements
 */
export const API_VERSION = defaultStr(process.env.API_VERSION);

export const API_PATH_PREFIX = `/${defaultStr(process.env.API_PATH_PREFIX,"api").trim().ltrim("/").rtrim("/")}/`;

/**** 
 * @see {@link API_VERSION} 
 * suffixe la racine de l'url des requêtes de l'API (@see {@link API_BASE_PATH}) par la version de l'api et par le texte /api
*/
export const API_BASE_PATH = `${API_PATH_PREFIX}${(API_VERSION?(API_VERSION.rtrim("/")+"/"):'')}`

/****
 * retourne l'adresse url de base vers laquelle les requêtes api seront effectuées par défaut
 * @return {string}
 */
export const getAPIHost = x=> {
    let host = getBaseHost();
    if(host){
        host = host.rtrim("/")+"/";
        host = host.rtrim(API_BASE_PATH).rtrim("/")+API_BASE_PATH;
        return host;
    }
    return API_BASE_PATH;
}

/**** 
 * construit une route/url (url|api) à partir des paramtères pris dynamiquement 
 * @param {...({string|object})} - les paramètres devant figurer dans la route à construire
 * @return {string} une chaine de caractère préfixée par la constante retournée par getAPIHost @see {@link getAPIHost}
 * @see {getAPIHost}
 * @see {buildUrl} de $cutils/uri
 * exemple : buildAPIPath ("app","route","final","settings",{test=2,t1=3}) => appp/route/final/settings?test=2&t1=3
 */
 export const buildAPIPath = function  (){
    let path = buildUrl.apply({},Array.prototype.slice.call(arguments,0));
    if(!isValidURL(path)){
        path="/"+path.ltrim("/");
        const host = getAPIHost().rtrim("/")+"/";
        return host+path.ltrim(host).ltrim("/");
    }
    return path;
}
/****
 * cette fonction retourne l'url absolue à partir d'un objet NextRequest où options passés en paramètre
 * @typedef {{headers : {{host:string}}}} NextRequest
 * @param {NextRequest} req - l'object {NextRequest}, @see 
 * @param {(string | {{url:string,path:string}})} options - les options supplémentaires
 *      - si options est une chaine de caractère, alors options est considéré comme le chemin à partir duquel l'url absolue sera construire
 *      - si options est un object, alors l'une des propriété url où path est utilisée pour construire l'url absolue
 * 
 */
export function absoluteUrl(req, options) {
    if(typeof options =='string'){
        options = {path:options}
    }
    let {url,path} = options;
    let localhostAddress = defaultStr(options.localhost,options.localhostAddress,'localhost:3000');
    var host = "";
    if(req && (req.headers) && req.headers.host){
        if(typeof req.headers.host ==='string'){
            host = req.headers.host;
        } else if(Array.isArray(req.headers.host) && req.headers.host.length ==1){
            host = req.headers.host[0]
        }
    }
    if(!host && typeof window !=='undefined' && window && window.location && window.location.host){
        host = window.location.host;
    }
    var protocol = /^localhost(:\d+)?$/.test(host) ? 'http:' : 'https:'
    if (
      req &&
      req.headers['x-forwarded-host'] &&
      typeof req.headers['x-forwarded-host'] === 'string'
    ) {
      host = req.headers['x-forwarded-host']
    }
    if(typeof host !=='string' || !host){
        host = localhostAddress;
    }
    if (
      req &&
      req.headers['x-forwarded-proto'] &&
      typeof req.headers['x-forwarded-proto'] === 'string'
    ) {
      protocol = req.headers['x-forwarded-proto'] + ':'
    }
    if(options.returnObj){
        return {
            protocol: protocol,
            host: host,
            origin: protocol + '//' + host,
          }   
    } else {
        return protocol + '//' + host.rtrim("/")+"/"+defaultStr(url,path).ltrim("/");   
    }
}
