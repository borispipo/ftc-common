import { sessionName } from "./utils";
import session from "$session";
import {isPromise} from "$cutils";

export const setDeviceNameRef = {
    current : null,
}
/*** permet de définir un nom pour le device name
 * @param {string|function} deviceNameOrDeviceNameGetter le nom de device si c'est une chaine de caractère, où bien la fonction permettant de récupérer le device name. cette fonction doit retourner une chaine de caractère où une promesse qui doit rendre une chaine de caractère représentatant le device name
 */
export default function setDeviceName(deviceNameOrDeviceNameGetter){
    if(!deviceNameOrDeviceNameGetter){
        deviceNameOrDeviceNameGetter = setDeviceNameRef.current;
    }
    if(typeof deviceNameOrDeviceNameGetter =='function' ){
        deviceNameOrDeviceNameGetter = deviceNameOrDeviceNameGetter();
    }
    return new Promise((resolve,reject)=>{
        if(typeof deviceNameOrDeviceNameGetter =='string'){
            session.set(sessionName,deviceNameOrDeviceNameGetter);
            return resolve(deviceNameOrDeviceNameGetter);
        } 
        if(isPromise(deviceNameOrDeviceNameGetter)){
            return deviceNameOrDeviceNameGetter.then((name)=>{
                if(typeof name =='string'){
                    session.set(sessionName,name);
                    return resolve(name);
                }
                reject({message:'résultat de la fonction deviceNameOrDeviceNameGetter incorrect. cette fonction doit retourner une chaine de caractère'});
            })
        }
        reject({message:'Type de paramètre incorrect, le deviceName doit être soit une chaine de caractère où une fonction rendant une chaine de caractère comme résultat'})
    });
} 