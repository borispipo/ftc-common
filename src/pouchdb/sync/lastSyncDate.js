import DateLib from "$date";
import $session from "$session";

const sessionName = "SYNC-SERVERS-LASTDAYS"

const getSessionData = x => defaultObj($session.get(sessionName));

export default {
    get : (serverCode) => {
        let ret = getSessionData();
        if(isNonNullString(serverCode)){
            let sDate = ret[serverCode];
            if(DateLib.isValidSQLDateTime(sDate)){
                let d = new Date(sDate);
                if(d != NaN && d) return d;
            }
            return undefined;
        }
        return undefined;
    },
    set : (serverCode)=>{
        if(isNonNullString(serverCode)){
            let ret = getSessionData();
            ret[serverCode] = new Date().format("yyyy-mm-dd HH:MM:ss");
            $session.set(sessionName,ret);
            return ret;
        }
        return false;
    }
}