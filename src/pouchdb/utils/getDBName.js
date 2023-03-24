import sanitizeName from "../dataFileManager/sanitizeName";
import session from "../dataFileManager/session";
/****** cette fonction prend en parmètre une chaine de caractère 
 *  et retourne le nom base de données correspondant à ce nom
 *  @pram : le nom de la bd à rechercher,
 *  exemple : getDBName(default||DEFAULT||current||CURRENT)
 *            getDBName(dbName)
 *            getDBName(common||commonDB) : retourne le nom de la base common
 *  @param {string}, le dataFileType de fichier de données pour laquele l'on veut récupérer la base de données par défaut
 */
export default function getDBName (dbName,dataFileType){
    ///pour expliciter le nom de la base par défaut, il suffit de déclarer comme nom de bd, la valeur default
    if(isNonNullString(dbName) && ["default","current"].includes(dbName.trim().toLowerCase())){
        dbName = "";
    }
    if(!isNonNullString(dbName)){
        return sanitizeName(session.get(dataFileType))
    }
    return sanitizeName(dbName);
}