import {isNonNullString} from "$cutils";

import $session from "$session";
const sessInfos = "SERVERS_REACHABLE_INFOS";
const infoType = "remoteDatabaseInfo".toLocaleLowerCase();

const INFOS = {
    isValid : (info)=> isObj(info) && isNonNullString(info.serverCode) && defaultStr(info.type).toLocaleLowerCase() == infoType && isNonNullString(info.dateTime),
    get : (server)=>{
        let ret = defaultObj($session.get(sessInfos));
        if(isNonNullString(server)){
            ret = ret[server] || null;
        }
        return ret;
    },
    remove : (server) =>{
        if(isObj(server)){
            server = defaultStr(server.code,server._id);
        }
        server = defaultStr(server);
        if(server){
            let g = INFOS.get();
            delete g[server];
            $session.set(sessInfos,g);
            return true;
        }
        return false;
    },
    setError : (args)=>{
        let {serverCode,error,force,...info} = defaultObj(args);
        if(!isNonNullString(serverCode)) return false;
        info = defaultObj(info);
        info.code = defaultStr(info.code,serverCode);
        info.serverCode = serverCode;
        info.type = infoType;
        let e = error  && typeof error !== 'boolean' ? error : {};
        let msg = defaultStr(e.msg,e.message);
        if(msg){
            if(isNonNullString(e.error)){
                msg+=", error : "+e.error;
            }
            if(isNonNullString(e.reason)){
                msg += ", Reason : "+e.reason;
            }
            msg += isDecimal(e.status)? ( ', status : '+e.status) : "";
            msg += isNonNullString(e.name)? (", name : "+e.name) : "";
        }
        info.msg = msg;
        let _info = defaultObj(INFOS.get(serverCode));
        info.dateTime = defaultStr(_info.dateTime,info.dateTime);
        info.hour = defaultStr(_info.hour,info.hour);
        info.date = defaultStr(_info.date,info.date);
        let v = INFOS.get();
        v[serverCode] = info;
        $session.set(sessInfos,v);
        return true;
    },
};

export default INFOS;