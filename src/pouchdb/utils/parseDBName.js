/**** parse dbName
 * @param {object/string}
 * @return {object : 
 *      dbName : le nom de la base,
 *      originName : le nom d'origine
 *      server : le serveur rattaché
 * }
 */

export default function parseDBName(dbName){
    let options = {}
    if(isNonNullString(dbName)){
        options = {dbName}
    } else if(isObj(dbName)){
        options = dbName;
    }
    dbName = defaultStr(options.realName,options.dbName,dbName);
    let {server} = options;
    let ret = {dbName,originName:dbName}
    if(isValidUrl(dbName)){
        let serv = dbName.split('/');
        let count = serv.length-1;
        while(count >= 0 && !isNonNullString(serv[count])){
            count --;
        }
        let sV = "";
        for(let i= 0; i < count; i++){
            if(isNonNullString(serv[i])){
                sV+= (isNonNullString(sV)? "/":'')+serv[i];
            }
        }
        let realDB = dbName;
        if(count>=0){
            dbName = serv[count];
        }
        server = defaultStr(server,sV)
        ret.dbName = dbName;
        ret.originName = realDB;
    }
    ret.server = defaultStr(server);
    return ret;
}