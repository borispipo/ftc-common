import defaultDataFiles from "./getAllDefault";
import sanitizeName from "./sanitizeName";
import {isObj,defaultStr} from "$cutils";
import isValidDataFile from "./isValidDataFile";

/**** vérifie si une base de données en question est commune 
 * @param {object|string} dataFile, le fichier de données/ ou son code. 
 *  S'il s'agit d'un object, alors cet objet sera vérifié s'il s'agit d'une source de données commune
 *  S'il s'agit d'une chaine de caractère, alors l'objet dataFile correspondant sera vérifié parmis la liste des fichiers de données
 *  et sa propriétés common sera testée.
 * @return {boolean} si vrai, alors il s'agit d'un fichier de données partagé par tous les utilisateurs
*/
export default function isCommon (dataFile){
    if(isValidDataFile(dataFile)){
        return dataFile.common || defaultStr(dataFile.type).toLowerCase().trim() =="common" ? true : false
    }
    const sCode = sanitizeName(dataFile);
    if(!sCode || !isObj(defaultDataFiles[sCode])) return false;
    const dF = defaultDataFiles[sCode];
    return dF.common || defaultStr(dF.type).toLowerCase().trim() =="common" ? true : false;
};

