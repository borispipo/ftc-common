import {defaultObj,defaultNumber,isNonNullString} from "$cutils";
import APP from "$capp/instance";
import Dimensions from "$cdimensions";
import isCommon from "../dataFileManager/isCommon";
/**** les différents sens de synchronisation */
export const syncDirections = {
    full : "full",
    asc : "asc",
    desc : "desc"
};

export const directionSeparator = "##";

/****  
 * prend un tableau de données dbsOrDFTypes, une chaine de caractère où un tableau,
 * puis pour chacune des données y trouvant dans le tableau, le convertis de la forme : {[clé1]:[syncDirection]}
 * les éléments du tableau sont de la forme : [dbName|dfType]##[syncDirection], où dbName represente le nom de la bd, dfType, le type de fichier de données
 * et syncDirection, représente la direction de synchronisation, l'une des valeurs de l'objet syncDirections
 * @param {Array|string}, tableau où chaine de caractères des éléments sur la forme suscitée et séparée par une virgule
 * 
*/
export const normalizeSyncDirection = (dbsOrDFTypes)=>{
    const result = {};
    dbsOrDFTypes = isNonNullString(dbsOrDFTypes)? dbsOrDFTypes.trim().split(",") : Array.isArray(dbsOrDFTypes) ? dbsOrDFTypes : [];
    dbsOrDFTypes.filter(isNonNullString).map((t)=>{
        const st = t.split(directionSeparator);
        const dat = st[0];
        if(!isNonNullString(dat)){
            return;
        }
        let syncDirection = defaultStr(st[1]).toLowerCase();
        if(!syncDirection || !syncDirections[syncDirection]){
            syncDirection = syncDirections[isCommon(dat)?"full":"desc"];
        }
        result[dat] = syncDirection;
    });
    return result;
}

export const getSyncOptions = (rest)=>{
    rest = defaultObj(rest);
    let freeRAMHigher = APP.getFreeRAM()>4;
    rest.batches_limit = defaultNumber(rest.batches_limit,freeRAMHigher? 50 : 25)
    rest.timeout = defaultDecimal(rest.timeout,300); //temps d'attente à 0.5s
    rest.batch_size = defaultNumber(rest.batch_size,freeRAMHigher?300:APP.getFreeRAM()>2 ? 200 : Dimensions.isDesktopMedia()?150:100); 
    rest.live = 'live' in rest ? rest.live : false;
    return rest;
}