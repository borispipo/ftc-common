import {defaultStr,defaultFunc,isNonNullString} from "$utils";

export default function prepareFilter(filter){
    if(isNonNullString(filter)){
        let type = filter.toLowerCase();
        filter = (s)=> type == defaultStr(s.type,'couchdb').toLowerCase();
    }
    return defaultFunc(filter,x=>true)
}