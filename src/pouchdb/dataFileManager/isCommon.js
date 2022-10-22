import commonDataFiles from "./commonDataFiles";
import sanitizeName from "./sanitizeName";
import {isObj} from "$utils";

export default function isCommon (dFCode,includeProjectsDataFile,tableName){
    includeProjectsDataFile = defaultBool(includeProjectsDataFile,true);
    let sCode = sanitizeName(dFCode,defaultStr(tableName,includeProjectsDataFile));
    if(isObj(commonDataFiles[sCode])) {
        if(sCode === 'project' && !includeProjectsDataFile) return false;
        return true;
    }
    return false;
};
