import $session from "$session";
import prepareFilter from "./prepareFilter";

const localServersSessionName = "LOCALS-SERVSESSIONNAME";
let _remove = (server,all) =>{
    if(server && server.url && server._id && server.localForComputer){
        delete all[server._id];
    }
    return all
}
const localServers = {
    getAll : (filter)=>{
        filter = prepareFilter(filter);
        let ret = {};
        Object.map($session.get(localServersSessionName),(s,code)=>{
            if(isObj(s) && s.localForComputer && isNonNullString(s._id) && filter(s,code)){
                ret[s._id] = s;
            }
        });
        return ret;
    },
    add : (server)=>{
        let all = localServers.getAll();
        if(server && isValidUrl(server.url) && server._id && server.localForComputer){
            all[server._id] = server;
            $session.set(localServersSessionName,all);
        }
        return all;
    },
    remove : (server)=>{
        let all = localServers.getAll();
        if(isArray(server)){
            for(let i in server){
                _remove(server[i],all);
            }
        } else {
            _remove(server,all);
        }
        $session.set(localServersSessionName,all);
        return all;
    },
    get : (server)=>{
        let all = localServers.getAll();
        let serverId = undefined;
        if(isNonNullString(server)){
            serverId = server;
        } else if(isObj(server) && isNonNullString(server._id)){
            serverId = server._id;
        }
        if(isNonNullString(serverId)){
            return all[serverId];
        }
        return null;
    },
    setAll : (servers)=>{
        $session.set(localServersSessionName,defaultObj(servers));
    },
}

export default localServers;