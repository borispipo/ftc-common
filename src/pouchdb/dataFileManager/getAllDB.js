import fetch from "./fetch";
import {defaultObj,isNonNullString} from "$cutils";
import fetch from "./fetch";
import getDB from "../getDB"

/*** retourne la liste des bases de données de l'application
 * @param {object} les options de la requête, de la forme : 
 * {
 *      filter {function}, le filtre à appliquer à chacun des fichiers de données de l'application
 * }
 * @return tableau des bases de données voulues dans les options de filtre
 * @return {Promise<Array<{db,...rest}>}
 */
export default function getAllDBFromDataFiles(options){
    options = defaultObj(options);
    const {filter,...rest} = options;
    const f = typeof filter =='function' ? f : x=>true;
    return fetch().then((dataFiles)=>{
        const promises = [];
        Object.map(dataFiles,(dF,dFCode)=>{
            if(filter(dF,dFCode) === false){
                return;
            }
            promises.push(getDB({...rest,dbName:dF.code||dFCode}));
        });
        return Promise.all(promises);
    });
}