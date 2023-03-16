import defaultDataFiles from "./getAllDefault";
import sanitizeName from "./sanitizeName";
import {isObj,defaultStr} from "$utils";

export default function isCommon (dFCode){
    const sCode = sanitizeName(dFCode);
    if(!sCode || !isObj(defaultDataFiles[sCode])) return false;
    const dF = defaultDataFiles[sCode];
    return dF.common || defaultStr(dF.type).toLowerCase().trim() =="common" ? true : false;
};
