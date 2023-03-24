/**** get configuration about the database local server */
import appConfig from "$capp/config";
import {isNonNullString,toSnakeCase,defaultStr,isValidUrl} from "$utils";

const prefix = "POUCHDB_LOCAL_SERVER_";

const mutateVal = (val)=>{
    if(val === "false"){
        val = false;
    }
    if(val ==='true'){
        val = true;
    }
    if(typeof val =='number' || typeof val =='boolean'){
        return val;
    }
    return val;
}

const getConfigValue = (key,validator)=>{
    if(!isNonNullString(key)) return undefined;
    validator = typeof validator =='function'? validator : x=>true;
    const confKey = prefix+toSnakeCase(key).toUpperCase().trim().ltrim("_");
    let val = appConfig.get(confKey);
    if(validator(val)) return val;
    val = mutateVal(process.env[confKey]);
    if(validator(val)) return val;
    return undefined;
}

const exits = ()=>getConfigValue("url",isValidUrl) && getStatus() && true || false;

const getStatus = ()=>{
    const status = getConfigValue("status");;
    if(status =='0') return 0;
    return status;
}

export default {
    get url (){
        return getConfigValue("url",isValidUrl);
    },
    get port (){
        return getConfigValue("port");
    },
    get status(){
        return getStatus();
    },
    get local() {
        return getConfigValue("local");
    },
    get syncData (){
        const v = getConfigValue("syncData");
        if(isNonNullString(v)) {
            return v.split(",").filter(e=>isNonNullString(e));
        }
        return Array.isArray(v)? v : [];
    },
    get databases(){
        const v = getConfigValue("databases");
        if(isNonNullString(v)) {
            return v.split(",").filter(e=>isNonNullString(e));
        }
        return Array.isArray(v)? v : [];
    },
    get username(){
        return getConfigValue("username");
    },
    get password(){
        return getConfigValue("password");
    },
    get oldDocsSince(){
        return getConfigValue("oldDocsSince");
    },
    /*** specify wheater local coonfig database exists */
    get exits(){
        return exits();
    },
    /***if the local server is set on the application*/
    get isSet(){
        return exits();
    }
}