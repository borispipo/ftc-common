// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
/***@namespace api/host */
import {getQueryParams,buildUrl,removeQueryString,isValidURL,queryString} from "$cutils/uri";
import defaultStr from "$cutils/defaultStr";
import {getAPIHost} from "./utils";

export * from "./utils";

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
