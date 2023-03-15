import CONSTANTS from "../constants";
import localSession from "$session";

/****** cette fonction prend en parmètre une chaine de caractère 
 *  et retourne le nom base de données correspondant à ce nom
 *  @pram : le nom de la bd à rechercher,
 *  exemple : getDBName(default||DEFAULT||current||CURRENT)
 *            getDBName(dbName)
 *            getDBName(common||commonDB) : retourne le nom de la base common
 */
export default function getDBName (dbName){
    ///pour expliciter le nom de la base par défaut, il suffit de déclarer comme nom de bd, la valeur default
    if(isNonNullString(dbName) && arrayValueExists(["default","current"],dbName.trim().toLowerCase())){
        dbName = "";
    } else if(isNonNullString(dbName) && arrayValueExists(dbName.toLowerCase().trim(),['common','commondb'])){
        dbName = CONSTANTS.COMMON_DB;
    }
    return defaultStr(dbName,localSession.get("currentDB"));
}