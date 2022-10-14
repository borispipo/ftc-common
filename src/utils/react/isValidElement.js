import * as ReactIs from "react-is";
export default function isValidElementCustom(element,includeStrOrText){
    if(ReactIs.isElement(element)) return true;
    if(includeStrOrText && (typeof element =="string" || typeof element =="number" || typeof element =='boolean')){
        return true;
    }
    if (Array.isArray(element)) {
        if(element.length == 0) return true;
        let isV = element.reduce((acc, e) => acc && isValidElementCustom(e,includeStrOrText), true);
        if(isV) return true;
    }
    return false;
}