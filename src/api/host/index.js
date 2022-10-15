// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
/***@namespace api/host */
import {getQueryParams,removeQueryString,isValidURL,queryString} from "$cutils/uri";
import defaultStr from "$cutils/defaultStr";
import {getAPIHost} from "./utils";

export * from "./utils";

/**** 
 * construit une route/url (url|api) à partir des paramtères pris dynamiquement 
 * @param {...({string|object})} - les paramètres devant figurer dans la route à construire
 * @return {string} une chaine de caractère préfixée par la constante retournée par getAPIHost @see {@link getAPIHost}
 * @see {getAPIHost}
 * exemple : buildAPIPath ("app","route","final","settings",{test=2,t1=3}) => appp/route/final/settings?test=2&t1=3
 */
 export const buildAPIPath = function  (){
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
    path = path && typeof path =="string" ? path : "";
    path = path.split("?")[0];
    let bPath = path.trim();
    if(!isValidURL(bPath)){
        bPath="/"+bPath.ltrim("/");
    }
    if(!isValidURL(path)){
        bPath = getAPIHost().rtrim("/")+"/";
        bPath = bPath+path.ltrim(bPath).ltrim("/");
    }
    if (qs.length > 0){
        qs = qs.trim().ltrim("?"); //chop off last "&"
        bPath = bPath + "?" + qs;
    }
    return bPath;
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
