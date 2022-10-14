import originalFetch from "unfetch";
import { buildAPIPath} from "./utils";
import { isObj,defaultNumber,defaultObj,extendObj,defaultStr} from "$utils";
import {NOT_SIGNED_IN,SUCCESS} from "./status";
import notify from "$active-platform/notify";
import {getToken,isValidToken} from "$cauth/utils";
import APP from "$app/instance";
import {timeout} from "./utils";
import {isClientSide} from "$platform";
import {prefixStrWithAppId} from "$app/config";

let codeVerifier = null;

export  function setCodeVerifierHeader(verifier) {
  codeVerifier = verifier;
}
export const getRequestHeaderKey = x=>{
  return prefixStrWithAppId(x);
}
export const getRequestHeaders = function (opts){
    opts = typeof opts !=="object" || Array.isArray(opts) || !opts ? {} : opts;
    const ret = {};
    const token = getToken();
    if(isValidToken(token)){
       ret.Authorization = "bearer "+token.token;
    }
    ret.mode = defaultStr(opts.mode,"cors");
    ret.headers = defaultObj(ret.headers);
    ret.headers['Access-Control-Allow-Origin'] = defaultStr(ret.headers['Access-Control-Allow-Origin'],'*');
    console.log(ret," is request header heinn")
    return ret;
}


export default function fetch (url, options = {}) {
  const {fetcher,checkOnline,url:u,path,...opts} = getFetcherOptions(url,options);
  const cb = ()=>{
    return timeout(fetcher(u, opts),defaultNumber(opts.delay,opts.timeout))
  }
  if(isClientSide() && (checkOnline === true || process.env.CAN_RUN_API_OFFLINE !== true) && !APP.isOnline()){
      return APP.checkOnline().then((state)=>{
         return cb();
      });
  }
  return cb();
};
export const get = fetch;
export const post = (url, options = {})=> {
  options = defaultObj(options);
  options.method = 'POST';
  return fetch(url,options);
};

const cType = 'Content-Type';

export const handleFetchResult = ({fetchResult:res,showError,json,isAuth,redirectWhenNoSignin}) =>{
   return new Promise((resolve,reject)=>{
      return json !== false ? res.json().then((d)=>{
         const response = {};
         ['ok','status','statusText','error','headers'].map((v)=>{
           response[v] = res[v];
         });
         response.success = response.status === SUCCESS ? true : false;
         const a =  {response,...d};
         if(response.success){
            return resolve(a)
         }
         if(d.error && typeof d.error =='string'){
            response.message = response.msg = d.error;
         }
         if(showError !== false){
            const message = defaultStr(response.message,response.msg);
            if(message){
              notify.error(message);
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
     if(isObj(opts.body)){
        Object.map(requestHeaders,(h,i)=>{
            if(!opts.body[i]){
              opts.body[i] = h;
            }
        });
        if(!opts.headers[cType]){
            opts.headers [cType] = defaultStr(opts.headers[cType],'application/json')
        }      
        opts.body  = JSON.stringify(opts.body)//new URLSearchParams(opts.body);
     }
     opts.url = buildAPIPath(url,opts.queryParams);
     opts.fetcher = fetcher;
     return opts;
}

export const getFetcher = getFetcherOptions;

