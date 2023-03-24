// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import getDB from "./getDB";
import {isFunction,isNonNullString,defaultArray,defaultFunc,defaultObj,isObj} from "$cutils";

export const getDataSuccessCB = ({findOptions,resolve,reject,successCb,db,errorCb},checkIndex) =>{
    db.find(findOptions).then(({docs})=>{
        if(isFunction(successCb)) successCb(docs);
        resolve(docs);
    }).catch(e=>{
        if(checkIndex && findOptions.use_index){
            delete findOptions.use_index;
            db.find(findOptions).then(({docs})=>{
                if(isFunction(successCb)) successCb(docs);
                resolve(docs);
            }).catch(e=>{
                if(isFunction(errorCb))errorCb(e);
                reject(e);
            })
            //console.log("could not lookup data for options ",idx,findOptions,db.getName(),e);
        } else {
            if(isFunction(errorCb))errorCb(e);
            reject(e);
        }
    });
};
/********
    cette fonction prend en paramètre une chaine de caractère et retourne une fonction qui lorsqu'elle est appelée
    devra retourner des données
    ////dataStr doit toujours avoir au moins un argument, le premier représente le nom de la table dans la base
    /// si un seul arguemnt est passé en paramètres, alors on récupère toutes les données dont la table match la valeur passée en paramtère
    ///  à plus de deux arguments, l'on considère qu'il s'agit de retourner les enfants dont l'id(table) est passé en paramètre
    ///  exemple dataStr :
                - common[tableName] ou commonDB[tableName]
                - dbName[tableName] : retourne un tableau contenant toutes les données dont la prop table match tablename
                - dbName[_id,field1,subsubField,.....] : récupère progréssivement les enfants de l'id table, pour récupérer intégralement 
                l'élément d'_id, il suffit d'attribuer une valeur non string à field1
                - dbName[_id,null|undefined||true||false], retourne l'élément Id dans la base
                /// les données sont récupérer de manière hiérarchique jusqu'au dernier enfant
                /// si le nom de la bd est omis, alors c'est la base par défaut qui est utilisée
        En somme, pour écupérer toutes les données qui match la table, alors préciser un seul argument : le nom de la table
                  pour récupérer l'élément d'id passé en paramètre, préciser au moins 2 arguments, avec comme deuxième une valeur null ou on string
                  pour récupérer progréssivement les enfants de l'élément dont l'id est passé en paramètre, préciser au moins deux arguments avec le deuxième,troisième, .....nième  obligatoirement non null
    Lorsqu'il s'agit des données de la table passée en paramètre à récupérer, l'on peut passer dans la variable 
    findOptions, les options supplémentaires à appliquer au plugin find de pouchDB. voir pouchdb-find pour en savoir plus
*/
export const getDataFunc = (dataStr,findOptions)=>{
    if(!isNonNullString(dataStr)) return null;
    findOptions = defaultObj(findOptions);
    let {server} = findOptions;
    let _sp,dbName,args;
    if(dataStr.indexOf("[") > -1){
        _sp = dataStr.split("[")
        dbName = isNonNullString(_sp[0])?_sp[0].trim():'';
        args = _sp[1]?_sp[1].split(",") : []
        for (var t in args){
            args[t] = args[t].replace("]","")
        }
        //la méthode dataStr doit avoir au moins un argument, qui est le nom de la table dans la bd
         {
            let table = args[0];
            args.shift(); //on élimnine le nom de la table dans la liste des arguments
            switch (defaultStr(dbName).toLowerCase()) {
                default:
                    //if(!isNonNullString(table)) return null;
                    return (successCb,errorCb) =>{
                        return new Promise((resolve,reject)=>{
                            //si dbName n'est pas définie, alors c'est la base par défaut qui est utilisée
                            //getDBFromName
                            getDB({dbName,table : isNonNullString(table)? table : undefined,server}).then(({db})=>{
                                //si arg[0] est défini alors table correspond à l'id de la données à récupérer dans la bd
                                //on cherchera progréssivement ses enfants dans les nom des seconds arguments
                                //car getDataFunc est sensé retourner une fonction qui lorsqu'elle est appelée, retourne une promesse qui devra rendre un ensemble de données
                                if(!isUndefined(args[0]) && isNonNullString(table)){//si args1[1] est définie, c'est qu'il s'agit des données de l'élément dont l'id est passé en paramètre
                                    db.get(table.toUpperCase()).then((data)=>{
                                        let d = {...data};
                                        for(let k in args){
                                            if(isObj(d) && isNonNullString(args[k]) && !arrayValueExists(['null','true','false'],args[k]+''.trim().toLowerCase())){
                                                d = d[args[k]];
                                            } else break;
                                        }
                                        if(isFunction(successCb)) {successCb(d,data);
                                        } else  resolve(d);
                                    }).catch(e=>{if(isFunction(errorCb))errorCb(e);else reject(e);})
                                } else {//on recherche toutes les données qui match la table passée en paramètre
                                    findOptions.selector = defaultObj(findOptions.selector);
                                    let use_index = findOptions.use_index === false ? false : true,foundIdIndex = undefined,_idSelector = undefined;
                                    if(use_index !== false && isArray(findOptions.selector.$and)){
                                        for(let i=0; i < findOptions.selector.$and.length; i++){
                                            if(isObj(findOptions.selector.$and[i]) && '_id' in findOptions.selector.$and[i]){
                                                use_index = false;
                                                foundIdIndex = i;
                                                _idSelector = findOptions.selector.$and[i];
                                                break;
                                            }
                                        }
                                    }
                                    
                                    if(_idSelector){
                                        findOptions.selector.$and[foundIdIndex] = findOptions.selector.$and[0];
                                        findOptions.selector.$and[0] = _idSelector;  
                                    }
                                    if(isNonNullString(table))  {
                                        let selTable = {table:{$eq:table.toUpperCase()}}
                                        if(_idSelector){
                                            findOptions.selector.$and.push(selTable);
                                        } else {
                                            findOptions.selector.$and = defaultArray(findOptions.selector.$and);
                                            findOptions.selector.$and.unshift(selTable);
                                        }
                                        if(use_index === false || findOptions.use_index === false){
                                            delete findOptions.use_index;
                                        } else {
                                            //findOptions.use_index = defaultStr(findOptions.use_index,"table");
                                        } 
                                    }
                                    let arg = {findOptions,resolve,reject,successCb,db,errorCb};
                                    if(isNonNullString(findOptions.use_index)){
                                        return db.createDefaultIndexes().then(x=>{
                                            getDataSuccessCB(arg,true);
                                        }).catch((e)=>{
                                           delete findOptions.use_index;
                                           getDataSuccessCB(arg,true);
                                        })//.finally(hidePreloader);
                                    }
                                    getDataSuccessCB(arg);
                                }
                            }).catch((e)=>{
                                console.log(e,' getting db form name')
                                if(isFunction(errorCb)){
                                    errorCb(e);
                                }
                                reject(e);
                            });
                        })
                    }
                    break;
            }
        }
    } 
    return null;
}


/**** retourne un ensemble des données à partir
    d'une chaine de caractèr passée en paramètre
    @param dataString : la chaine de caractère
    @param successCb : la fonction de rappel en cas de success
    @param errorCb : la fonction de rappel en cas d'erreur
    @param findOptions : les options de recherche des données
    Exemple getData(dataStr,{...findOpts})
            getData(dataStr,successCb,{...findOpts})
            getData(dataStr,successCb,errorCb,{...findOpts})
 */
const getData = (dataStr,successCb,errorCb,findOptions)=>{
    if(isObj(successCb) && !isFunction(successCb)){
        let t = findOptions;
        findOptions = successCb;
        successCb = undefined;
        if(isFunction(errorCb)){
            successCb = errorCb;
            errorCb = isFunction(t)? t : undefined;
        }
    } else if(isObj(errorCb) && !isFunction(errorCb)){
        findOptions = errorCb;
        errorCb = undefined;
    }
    
    return new Promise((resolve,reject)=>{
        const dataF = getDataFunc(dataStr,findOptions);
        if(!isFunction(dataF)){
            let e = {
                code : 808,
                message : 'Function non trouvée pour la chaine dataStr'
            };
            reject(e)
            if(isFunction(errorCb)) errorCb(e)
        } else {
            resolve(dataF(successCb,errorCb))
        }
    });
}

export default getData;