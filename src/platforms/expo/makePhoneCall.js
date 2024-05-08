// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import * as Linking from 'expo-linking';
import {isNonNullString,isObj,defaultObj,isPromise} from "$cutils";
import {isMobileNative,isChromeBrowser} from "$cplatform";
import notify from "$active-platform/notify";
import ButtonSheetProvider from "$ecomponents/BottomSheet/Provider";

export const canMakePhoneCall = ()=> isMobileNative() || isChromeBrowser();

export const isValidPhoneNumber = (tel)=>{
    return isNonNullString(tel) && /^-?\d+$/.test(tel.ltrim("+")) && tel.length >= 6;
}

/**** permet d'exécuter un appel téléphonique
 * @param {string} le numéro de téléphone à appeler
 * @return {Promise}
 */
export function makePhoneCall(tel,options){
    if(!canMakePhoneCall()) {
        return Promise.reject({status:false,msg:'Vous ne pouvez effectuer un appel qu\'a partir d\'un téléphone mobile android ou ios'}) 
    }
    if(isObj(tel)) return makePhoneCallFromObj(tel,options);
    if(!isNonNullString(tel)){
        return Promise.reject({status:false,msg:"Le numéro de téléphone à appeler doit être une chaine de caractère de nombres non nulle"})
    }
    tel.replaceAll(" ","").trim(); 
    if(tel.startsWith("+")){
        tel = "+"+tel.ltrim("+");
    }
    if(!isValidPhoneNumber(tel)){
        return Promise.reject({status:false,msg:"Le numéro de téléphone "+tel+" que vous désirez appeler est invalide, merci d'entrer un numéro de téléphone valide"})
    }
    return new Promise ((resolve,reject)=>{
        Linking.openURL(`tel:${tel}`);
        notify.success("appel lancé au Numéro de teléphone ["+tel+"]")
    })
}

export const makePhoneCallFromObj = (rowData,options)=>{
    if(!isObj(rowData)) return Promise.reject({
        status : false,
        msg : "Type d'objet invalide pour effectuer un appel téléphonique"
    });
   
    return selectPhoneNumber(rowData,{
        title : 'Sélectionner un numéro à appeler',
        yes : {icon : "phone",text:'Appeler'},
        ...defaultObj(options)
    }).then((phoneNumber)=>{
        return makePhoneCall(phoneNumber);
    }).catch((e)=>{
        console.log(e," making phone call from object");
        notify.warning(e);
    })
}

/*** permet de sélectionner un numéro de téléphone à appeler dans un objet portant plusieurs champ de numéro de téléphone 
 * @param rowData {object}, l'objet sur lequel selectionner le numéro à appeler
 * @param options {object}, les options à utiliser pour la sélection du numéro à appeler
 *      options est de la forme : {
 *          phoneFields : {array}, tableau contenant la liste des champs de type numéro à utiliser pour récupérer les numéros de téléphone de l'objet rowData
 *      }
 * 
*/
export const selectPhoneNumber = (rowData,options)=>{
    if(!isObj(rowData)) return Promise.reject({stauts:false, msg:'Type d\'objet non définit'});
    if(typeof options =='function'){
        options = options(rowData);
    }
    options = defaultObj(options);
    if(options.fetchAndMakePhoneCall === true && typeof options.fetch =='function'){
        return fetchAndMakePhoneCall({...options,fetchAndMakePhoneCall:undefined});
    }
    let phoneNumbers = [];
    ///l'on peut choisir d'annuler faire l'appel téléphonique en cours en passent le paramètre phoneFields à false
    if(options.phoneFields === false){
        return Promise.reject({
            msg : 'Annulée par la fonction de rappel',
            status : false,
        })
    }
    const phoneFields = Array.isArray(options.phoneFields) && options.phoneFields.length ? options.phoneFields : ["tel","phone","mobile","mobile1","mobile2"];
    return new Promise((resolve,reject)=>{
        phoneFields.map((telStr)=>{
            if(!isNonNullString(telStr) || !isNonNullString(rowData[telStr])) return;
            let tel = rowData[telStr];
            let rawTel = tel;
            tel = tel.replaceAll(" ","").replaceAll("-","").trim();
            if(tel.startsWith("+")){
                tel = "+"+tel.ltrim("+");
            }
            if(/^-?\d+$/.test(tel.ltrim("+"))){
                phoneNumbers.push({text:rawTel,code:tel});
            }
        })

        if(phoneNumbers.length == 0){
            const msg = "Aucun numéro de téléphone à sélectionner pour effectuer l'appel";
            notify.warning(msg);
            return reject({status:false,msg})
        }
        if(phoneNumbers.length ==1){
            resolve(phoneNumbers[0].code);
            return phoneNumbers[0].code
        } else {
            const pRef = ButtonSheetProvider.getProviderRef
            if(!typeof pRef =='function') return reject({});
            const ref = pRef();
            if(!ref || typeof ref.open !=='function') return reject({});
            return ref.open({
                title : 'Sélectionner un numéro',
                ...defaultObj(options.bottomSheetProps),
                renderMenuContent : true,
                items : phoneNumbers,
                onPressItem : ({item})=>{
                    ref.close();
                    resolve(item.code);
                }
            });
        }
    })
}

/**** 
 * permet d'effectuer une action de récupération des données distante afin d'effectuer l'appel
 * @param {func|object} args . si args est une fonction alors la fonction args doit être exécutée et doit retourner une promesse qui une fois rendue renvera l'objet à exploiter pour effectuer l'appel
 * 
 * 
 */
export const fetchAndMakePhoneCall = (args)=>{
    if(typeof args =='function'){
        args = {fetch:args};
    }
    const {fetch,...rest} = defaultObj(args);
    if(typeof fetch !=='function') return Promise.reject({
        msg : 'Unable to fetch data before make call, la fonction fetch permettant de récupérer les données à exploiter pour le lancement d\'appel est non définie',
    });
    const r = fetch(args);
    if(isValidPhoneNumber(r)){
        return makePhoneCall(r,rest);
    }
    if(isObj(r)){
        return makePhoneCallFromObj(r,rest);
    }
    if(isPromise(r)){
        return r.then((d)=>{
            if(isValidPhoneNumber(d)){
                return makePhoneCall(d,rest);
            }
            if(isObj(d)){
                return makePhoneCallFromObj(d,rest);
            }
        }).catch((e)=>{
            console.log(e," fetching and make call");
        })
    }
    return Promise.reject({
        message : 'La valeur retournée par la fonction fetchAndMakeCall doit être soit un objet où une promesse'
    });
};

export default makePhoneCall;