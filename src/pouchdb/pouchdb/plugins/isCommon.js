
import isCommon from "../../dataFileManager/isCommon";
import {defaultStr} from "$cutils";
export default function isCommonPouchDB(){
    return !!(this.infos?.common || isCommon(this?.infos) || isCommon(this.getName()) || defaultStr(this.infos?.type).toLowerCase()==="common");
}