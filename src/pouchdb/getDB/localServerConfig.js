/**** get configuration about the database local server */
import appConfig from "$capp/config";
import {isNonNullString,toSnakeCase,defaultStr,isValidUrl} from "$cutils";
import {normalizeSyncDirection} from "../sync/utils";

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

const getConfigValue = (key,processEnvValue,validator)=>{
    if(!isNonNullString(key)) return undefined;
    validator = typeof validator =='function'? validator : x=>true;
    const confKey = prefix+toSnakeCase(key).toUpperCase().trim().ltrim("_");
    let val = appConfig.get(confKey);
    if(validator(val)) return val;
    val = mutateVal(processEnvValue);
    if(validator(val)) return val;
    return undefined;
}

const exits = ()=>getConfigValue("url",process.env.POUCHDB_LOCAL_SERVER_URL,isValidUrl) && getStatus() && true || false;

const getStatus = ()=>{
    const status = getConfigValue("status",process.env.POUCHDB_LOCAL_SERVER_STATUS);
    if(status =='0') return 0;
    return status;
}

export default {
    get url (){
        return getConfigValue("url",process.env.POUCHDB_LOCAL_SERVER_URL,isValidUrl);
    },
    get port (){
        return getConfigValue("port",process.env.POUCHDB_LOCAL_SERVER_PORT);
    },
    get status(){
        return getStatus();
    },
    get local() {
        return getConfigValue("local",process.env.POUCHDB_LOCAL_SERVER_LOCAL);
    },
    /*** les types de données à synchroniser: tableau de la forme : 
     * [type1]##[full|asc|desc]
     */
    get syncDataTypes (){
        return normalizeSyncDirection(getConfigValue("syncDataTypes",process.env.POUCHDB_LOCAL_SERVER_SYNC_DATA_TYPES));
    },
    /*** la liste des bases de données à synchroniser, tableau de la forme : 
     *  [dbName]##[full|asc|desc], permet de spécifier pour chaque type de données, le type de synchronisation à faire
     */
    get databases(){
        return normalizeSyncDirection(getConfigValue("databases",process.env.POUCHDB_LOCAL_SERVER_DATABASES));
    },
    get username(){
        return getConfigValue("username",process.env.POUCHDB_LOCAL_SERVER_USERNAME);
    },
    get password(){
        return getConfigValue("password",process.env.POUCHDB_LOCAL_SERVER_PASSWORD);
    },
    get oldDocsSince(){
        return getConfigValue("oldDocsSince",process.env.POUCHDB_LOCAL_SERVER_OLD_DOCS_SINCE);
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