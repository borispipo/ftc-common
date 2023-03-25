import session from "$session";
import { getSessionKey as gsKey } from "$cauth/utils/session";
import {isNonNullString,defaultStr,isObj} from "$cutils";

const getSessionKey = ()=>{
    return gsKey("pouchdb-cached-by-type");
}

const isNotEmpty = (key)=>{
    return isNonNullString(key);
}

const getSessionData = (key)=>{
    const data = defaultObj(session.get(getSessionKey()));
    if(isNotEmpty(key)){
        return data[key];
    }
    return data;
}

const setSessionData = (key,value)=>{
    const sessionKey = getSessionKey();
    const sdata = getSessionData(); 
    if(isNotEmpty(key) && value !== undefined){
        sdata[key] = value;
         session.set(sessionKey,sdata);
    } else if(isObj(key)){
        session.set(sessionKey,{...sdata,...key});
    }
}

/**** retrieve the default db based on its type 
 * récupère la base de données de l'application sur la base de son type
   @param {string} type, le type de fichier de données qu'on souhaite récupérer la base de données par défaut, cachée à l'utilisateur
   @return {string}, la base de données par défaut, catchée à l'utilisateur 
*/
export const getCurrentDB = (type)=>{
    if(isObj(type)){
        type = defaultStr(type.dataFileType,type.type);
    }
    if(!isNonNullString(type)) {
        console.error("invalid db type ",type," you must specify the type we want to retrieve defautl db")
        return "";
    }
    return defaultStr(getSessionData());
}

export const setCurrentDB = (dbName,type)=>{
    if(!isNonNullString(type)) {
        console.error("invalid db type ",type," you must specify the type we want to retrieve defautl db")
        return "";
    }
    return setSessionData(type,defaultStr(dbName));
}

export default {
    get : getCurrentDB,
    set : setCurrentDB,
    getCurrentDB,
    setCurrentDB,
}
