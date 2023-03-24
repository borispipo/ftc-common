import localServers from "./localServers";
import prepareFilter from "./prepareFilter";
import {defaultFunc} from "$utils";
import fields from "./fields";

export const getAllServers = (filter)=>{
    filter = prepareFilter(filter);
    let ret = {};
    localServers.getAll((s,code)=>{
        if(filter(s,code)){
            ret[s._id] = s;
        }
    });
    return ret;
}
export const toggle = (filter,status)=>{
    status = defaultVal(status,0);
    let _localServers = {};
    let allLocal = localServers.getAll();
    filter = defaultFunc(filter, x=>true);
    Object.map(allLocal,(s,i)=>{
        if(isObj(s) && s._id){
            s.status = filter(s,i) ? status : s.status;
            _localServers[s._id] = s;
        }
    });
    localServers.setAll(_localServers);
}
export const disableAll = (filter) =>toggle(filter,0);
export const enableAll = (filter) =>toggle(filter,1);
export const toggleAllStatus = toggle;
export {
    getAllServers as getAll,
    fields,
}

export default {
    getAll : getAllServers,
    disableAll,
    fields,
    enableAll,
    toggleAllStatus,
}