//import {JWT_SECRET} from "@env";
const JWT_SECRET = "@jwt-secrect"
import JWT from 'expo-jwt';
import defaultStr from '../utils/defaultStr';

///for more, @see : https://github.com/blake-simpson/expo-jwt
export const algorithms = {
    HS256 : 'HS256',
    HS384 : 'HS384',
    HS512 : 'HS512',
    NONE : 'none',
} 

export const defaultAlgorithm = "HS256";

export const getOptions  = (options,key) =>{
    if(key && typeof key =="object"){
        options = typeof options =="object" && options ? options : key;
    }
    options = options && typeof options =='object' ? options : {};
    options.algorithm =  defaultStr(options.algorithm).toUpperCase();
    if(!algorithms[options.algorithm]){
        options.algorithm = defaultAlgorithm;
    }
    return options;
}

export const encode = (data,key,options) =>{
    options = getOptions(options,key);
    key = key && typeof key =="string" ? key : JWT_SECRET;
    return JWT.encode(data,key,options);
}

export const decode = (token,key,options) =>{
    options = getOptions(options,key);
    key = key && typeof key =="string" ? key : JWT_SECRET;
    return JWT.decode(token,key,options);
}