// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {getQueryParams} from "$cutils/uri";
import {extendObj,defaultObj,defaultNumber,defaultStr,isObj,isObjOrArray} from "$cutils";
import React from "$react";
export * from "./host";

///si l'on fait la requête vers la recherche du token
export const IS_AUTH_TOKEN = "IS_AUTH_TOKEN";

export const AUTH_TOKEN_PATH = "auth/token";

///la prop permettant d'indiquer s'il s'agit d'une api de type Query
export const IS_QUERY_API = "IS_QUERY_APID";


///vérifie s'il s'agit d'une requête de demande d'un token
export function isFetchAuthTokenApi(options){
    return defaultObj(options)[IS_AUTH_TOKEN]? true : false;
}
/**
 * S'il s'agit d'une requête de type Query
 * @param {*} options 
 * @returns 
 */
export function isFetchQueryApi (options){
    return defaultObj(options)[IS_QUERY_API]? true : false;
}

export const canCheckOnline = process.env.CAN_RUN_API_OFFLINE !== "false" && process.env.CAN_RUN_API_OFFLINE !== "0" ? true : false && process.env.CAN_RUN_API_OFFLINE !== false;
export const canFetchOffline = !canCheckOnline;
export const parseWhere = (where)=>{
    if(!isObjOrArray(where)) return where;
    const result = Array.isArray(where)? [] : {};
    Object.map(where,(v,i)=>{
        let key = i , value = v;
        result[key] = isObjOrArray(v)? parseWhere(v) : v;
    });
    return result;
}

/****retourne les données, transmises à la requête 
 * @param {object} l'objet requête en cours
 * @param {options} les options à utiliser pour la recupération des données
 * les options sont de la forme : 
 *  {
 *      queryString|getQueryParams {boolean}, si les queryString seront pris en compte
 *      body|getBodyData {boolean}, si les données du corps de la requêtes seront pris en comptes
 *      fields : {array|string}, les champs qui seront exploités pour être retournés
 *      si fields == 'all', tous les champs seront retournés
 *      si fields est un tableau, alors tous les champs qui y sont spécifiés seront retournés
 * }
*/
export const getRequestData = (req,options)=>{
    if(options === true){
        options = {fields:'all'};
    }
    options = defaultObj(options);
    if(!req || !req.url || typeof req !=='object') {
        return {};
    }
    const ret = extendObj(true,{},
        options.queryString !== false && options.getQueryParams !== false ? getQueryParams(req.url) : null,
        options.body !== false && options.data !== false ? req.body : null,
        (v,name)=>{
            return  typeof v !=='function'? true : false;
        },
    );
    if(isObjOrArray(ret.where)){
        const where = parseWhere(ret.where);
        ret.where = where;
    }
    if(!Array.isArray(ret.order)){
        delete ret.order;
    }
    if(typeof ret.offset !=='number' || !ret.offset){
        delete ret.offset;
    } else {
        ret.offset = Math.ceil(ret.offset);
    }
    if(typeof ret.limit !=='number' || !ret.limit){
        delete ret.limit;
    } else {
        ret.limit = Math.ceil(ret.limit);
    }
    let {fields} = options;
    if(!fields){
        fields = ["where","fields","attributes","order","offset","limit","findAndCount"];//par défault le champ qui peut être utilisé pour la requête
    }
    if((typeof fields =='string' && fields.toLowerCase()==="all")){
        return ret;
    } 
    if(Array.isArray(fields) && fields.length){
        const r = {};
        fields.map((v,i)=>{
            if(typeof v =='string' && v){
                if(ret[v] === undefined) return;
                if(typeof ret[v] ==='object' && !Object.size(ret[v],undefined,true)) return;
                r[v] = ret[v];
            }
        })
        return r;
    }
    return ret;
}

///delay d'attente de connexion : peut être définie dans la variable d'environnement API_FETCH_TIMEOUT
const t = process.env.API_FETCH_TIMEOUT && (typeof process.env.API_FETCH_TIMEOUT =='string'? parseInt(process.env.API_FETCH_TIMEOUT):process.env.API_FETCH_TIMEOUT); 
export const FETCH_DELAY = defaultNumber(t,30000);

export async function timeout(promise,delay,errorArgs) {
  delay = typeof delay =='number' && delay ? delay : FETCH_DELAY;
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      errorArgs = defaultObj(errorArgs);
        reject({msg:"le temps de réponse expiré!!le serveur où la ressource demandée peut ne pas être disponible",...React.getOnPressArgs(errorArgs)})
    }, delay)
    promise.then(resolve, reject);
  })
}

export const isPostMethod = function(req){
    return isObj(req) && defaultStr(req.method).toUpperCase()=="POST"? true : false;
}
export const isGetMethod = function(req){
    return isObj(req) && defaultStr(req.method).toUpperCase()=="GET"? true : false;
}
export const isGetRequest = isGetMethod;
export const isPostRequest = isPostMethod;

/****
 * Valide une requête d'api
 * @param {object} req, l'objet requête
 * @param {string} method, la méthode qui doit être valide
 */
export const validateRequest = function(req,res,method){
    if(typeof res =='string'){
        const t = method;
        method = defaultStr(method,res);
        res = method;
    }
    method = defaultStr(method).toUpperCase();
    if(isObj(req) && req.method && defaultStr(req.method).trim().toUpperCase()!= method.trim()){
        if(isObj(res) && typeof res.status =='function'){
            const error = {status:METHOD_NOT_ALLOWED,message:"Seulle les méthodes {0} sont acceptées".sprintf(method)};
            res.status(METHOD_NOT_ALLOWED).json(error);
        }
        return false;
    }
    return true;
}
export const isValidRequest = validateRequest;
export const isValidPostRequest = function(req,res){
    return validateRequest(req,res,"post");
}
export const isValidGetRequest = function(req,res){
    return validateRequest(req,res,"get");
}
export const validateGetRequest = isValidGetRequest;
export const validatePostRequest = isValidPostRequest;