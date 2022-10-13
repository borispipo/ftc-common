import * as React from "react";
const {isValidElement} = React;
export default function isValidElementCustom(element,includeStrOrText){
    if(includeStrOrText && (typeof element =="string" || typeof element =="number" || typeof element =='boolean')){
        return true;
    }
    if(isValidElement(element)) return true;
    if(Array.isArray(element)){
        if(element.length ===0) return true;
        for(let i = 0;i <element.length; i++){
            if(isValidElementCustom(element[i],includeStrOrText)){
                return true;
            }
        }
        return false;
    }
    return false;
}