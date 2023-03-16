import getDBNamePrefix from "./getDBNamePrefix";

export default function sanitizeDBName(dbName,isServer){
    let prefix = getDBNamePrefix(isServer);
    dbName = defaultStr(dbName).toLowerCase().replaceAll(" ","__").replaceAll(".","-");
    dbName = (prefix+(dbName.ltrim(prefix))).trim();
    return dbName;
};
