// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
/**@namespace api/host/utils */
import defaultStr from "$cutils/defaultStr";

let localhost = undefined;

/*** retourne l'url locale à l'application
 * @function
 * @return {string} - l'url locale à l'application
 */
export const getLocalHost =  () =>{
    if(localhost) return localhost;
    if(typeof window !=='undefined' && window && window.location){
        const port = window.location.port;
        localhost = window.location.protocol + '//' + window.location.hostname+(port?(":"+port):"");
    }
    return localhost;
}

/**** retourne l'url de base utile pour les requêtes vers l'api
 * @return {string} l'url racine pour les requêtes vers l'api
 */
export const getBaseHost = x=>{
    return defaultStr(process.env.API_HOST,getLocalHost());
}

/****
 * la version de l'api, cette variable peut être issue de la propriété API_VERSION des variables d'environnements
 */
export const API_VERSION = defaultStr(process.env.API_VERSION);

/**** 
 * @see {@link API_VERSION} 
 * suffixe la racine de l'url des requêtes de l'API (@see {@link API_BASE_PATH}) par la version de l'api et par le texte /api
*/
export const API_BASE_PATH = "/api/"+(API_VERSION?(API_VERSION+"/"):'')

export const PROTECTED_API_BASE_PATH = API_BASE_PATH.rtrim("/")+"/protected/";

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

/***@function
 * @alias {@link getAPIHost} alias à la fonction getAPIHost
 */
export const getApiHost = getAPIHost;