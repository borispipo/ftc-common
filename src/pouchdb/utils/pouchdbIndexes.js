// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

///used to set indexes of pouchdb database
const indexRef = {current:{}};
import dbName from "../dataFileManager/dbName";
import dataFileIndexes from "../dataFileManager/indexes";
import {isObj} from "$utils";

export const get = () =>{
    if(!isObj(indexRef.current[dbName])){
        indexRef.current[dbName] = dataFileIndexes;
    }
    return indexRef.current;
}

export const set = (databases) =>{
    if(typeof databases =='object' && databases){
        indexRef.current = databases;
    }
    return indexRef.current;
}

/*** permet d'étendre les index associés aux fichiers de données
 * @param {object|Array} la liste des index supplémentaires, de la forme 
 *  {
 *      ///1er forme : objet ayant un champ name et un champ field
 *      [dataFileType|dbName] : { // la clé représente le index de dataFile où le nom de la bd, pour un index particulier sur la bd
 *          name {string} le nom de l'index
 *          fields : [field1{string},[field2{string}]], les champs à utiliser pour l'index
 *      },
 *      //2 ème représentation : tableau ayant deux éléments, le premier élément représentant les infos sur l'index, idem à la premiere forme, le deuxième porte les informations sur la génération de la vue associée
 *      [dataFileType|dbName] : [
*           { 
                name {string} le nom de l'index
 *              fields : [field1{string},[field2{string}]], les champs à utiliser pour l'index
            },
            {
                name : {string}, le nom de l'index
                views : { //la liste des vues déclarées
                    [refVueIndex1] : {
                        map : (doc)=> // function map,
                        reduce : (doc)=> fonction reduce 
                    }

                }
            }
 *      ],
 * }
*/
export function extendIndexes(indexes){
    const dbIndexes = get();
    if(!isObj(indexes)) return dbIndexes;
    Object.map(indexes,(dbIndex,dbNameOrType)=>{
        if(!isObj(dbIndex)) return;
        dbIndexes[dbNameOrType] = extendObj({},dbIndexes[dbNameOrType],dbIndex);
    });
    return set(dbIndexes);
}

export default {
    get,set,extendIndexes
};

