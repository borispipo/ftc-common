
import isCommon from "../../dataFileManager/isCommon";
export default function isCommonPouchDB(){
    return !!(isCommon(this.getName()) || this.infos?.common);
}