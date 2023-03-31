import {defaultStr,isNonNullString} from "$cutils";
import getPouchDBNamePrefix from "./getPouchDBNamePrefix";
import FIXED_CONSTANTS from "../constants";
import {prefixStrWithAppId} from "$capp/config";
export default function getDBNamePrefix(isServer){
    let prefix = defaultStr(prefixStrWithAppId());
    if(isNonNullString(FIXED_CONSTANTS.DB_NAME_PREFIX)){
        prefix = FIXED_CONSTANTS.DB_NAME_PREFIX;
    }
    let dbP = isServer ? "":getPouchDBNamePrefix().trim();
    if(dbP){
        dbP = dbP.rtrim("/")+"/";
    }
    prefix = prefix.toLowerCase().ltrim("/").rtrim("/").replaceAll(" ","__").replaceAll(".","-");
    prefix = dbP+((dbP+prefix.ltrim(dbP)).replaceAll("//","/")).ltrim(dbP);
    return prefix
}