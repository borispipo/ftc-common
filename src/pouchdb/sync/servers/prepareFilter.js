import {defaultStr,defaultFunc,isNonNullString} from "$cutils";

export default function prepareFilter(filter){
    if(isNonNullString(filter)){
        let type = filter.toLowerCase();
        filter = (s)=> type == defaultStr(s.type,'couchdb').toLowerCase();
    }
    return defaultFunc(filter,x=>true)
}