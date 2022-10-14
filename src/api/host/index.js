import {getQueryParams,removeQueryString,isValidURL,queryString} from "$cutils/uri";
import defaultStr from "$cutils/defaultStr";
import {getAPIHost} from "./utils";

export * from "./utils";

/**** cette fonction a pour rôle de préfixer toutes les routes passés en paramètre par la chaine de caractère définie dans la constante
 * @param path {string} : la chaine de caractère qu'on souhaite préfixée
 * @param params {object} : les paramètres à ajouter à la requête
 * @return {string} une chaine de caractère préfixée par la constante retournée par getAPIHost
 * exemple : buildAPIPath ("app","route","settings",{test=2}) => appp/route/settings?test=2
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
