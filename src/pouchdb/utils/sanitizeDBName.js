import getDBNamePrefix from "./getDBNamePrefix";

export default function sanitizeDBName(dbName,isServer){
    const prefix = getDBNamePrefix(isServer);
    dbName = defaultStr(dbName).toLowerCase().replaceAll(" ","__").replaceAll(".","-");
    return (prefix+(dbName.ltrim(prefix))).trim();
};
