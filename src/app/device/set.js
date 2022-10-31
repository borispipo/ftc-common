import { sessionName } from "./utils";
import session from "$session";
import {isPromise} from "$cutils";

export const setDeviceIdRef = {
    current : null,
}
/*** permet de définir un nom pour le device name
 * @param {string|function} deviceIdOrDeviceIdGetter le nom de device si c'est une chaine de caractère, où bien la fonction permettant de récupérer le device name. cette fonction doit retourner une chaine de caractère où une promesse qui doit rendre une chaine de caractère représentatant le device name
 */
export default function setDeviceId(deviceIdOrDeviceIdGetter){
    if(!deviceIdOrDeviceIdGetter){
        deviceIdOrDeviceIdGetter = setDeviceIdRef.current;
    }
    if(typeof deviceIdOrDeviceIdGetter =='function' ){
        deviceIdOrDeviceIdGetter = deviceIdOrDeviceIdGetter();
    }
    return new Promise((resolve,reject)=>{
        if(typeof deviceIdOrDeviceIdGetter =='string'){
            session.set(sessionName,deviceIdOrDeviceIdGetter);
            return resolve(deviceIdOrDeviceIdGetter);
        } 
        if(isPromise(deviceIdOrDeviceIdGetter)){
            return deviceIdOrDeviceIdGetter.then((name)=>{
                if(typeof name =='string'){
                    session.set(sessionName,name);
                    return resolve(name);
                }
                reject({message:'résultat de la fonction deviceIdOrDeviceIdGetter incorrect. cette fonction doit retourner une chaine de caractère'});
            })
        }
        reject({message:'Type de paramètre incorrect, le deviceId doit être soit une chaine de caractère où une fonction rendant une chaine de caractère comme résultat'})
    });
} 