// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import getDB from "./getDB";
import {isNonNullString,defaultArray,defaultObj,isObj} from "$cutils";
import {PouchDB} from "./pouchdb";


/**** permet de retourner les données à passer à la fonction getData, pour la récupération des bases de données de l'application
 * @param {object} options, les options de la requêtes, de la forme : 
 * {    
 *    fetchOptions{object}, les fetchOptions à passer à la fonction pouchdb find
 *    table|tableName {string}, le nom de la table des données
 *    
 * }
 */
export const getFetchDataOptions = (options)=>{
    options = defaultObj(options);
    const fetchOptions = options.fetchOptions = Object.assign({},options.fetchOptions);
    const table = options.table = defaultStr(options.tableName,options.table,fetchOptions.table);
    fetchOptions.selector = defaultObj(fetchOptions.selector,options.selector);
    if(!Object.size(fetchOptions.selector,true) && isObj(options.selector) && Object.size(options.selector,true)){
        fetchOptions.selector = options.selector;
    }
    let use_index = fetchOptions.use_index === false || options.use_index === false ? false : true,foundIdIndex = undefined,_idSelector = undefined;
    if(use_index !== false && isArray(fetchOptions.selector.$and)){
            for(let i=0; i < fetchOptions.selector.$and.length; i++){
                if(isObj(fetchOptions.selector.$and[i]) && '_id' in fetchOptions.selector.$and[i]){
                use_index = false;
                foundIdIndex = i;
                _idSelector = fetchOptions.selector.$and[i];
                break;
            }
        }
    }
    if(_idSelector){
        fetchOptions.selector.$and[foundIdIndex] = fetchOptions.selector.$and[0];
        fetchOptions.selector.$and[0] = _idSelector;  
    }
    if(isNonNullString(table))  {
        let selTable = {table:{$eq:table.toUpperCase()}}
        if(_idSelector){
            fetchOptions.selector.$and.push(selTable);
        } else {
            fetchOptions.selector.$and = defaultArray(fetchOptions.selector.$and);
            fetchOptions.selector.$and.unshift(selTable);
        }
    }
    if(use_index === false || fetchOptions.use_index === false){
        delete fetchOptions.use_index;
    } else {
        fetchOptions.use_index = isNonNullString(fetchOptions.use_index) && fetchOptions.use_index || undefined;
    } 
    /*if(!_idSelector && !isNonNullString(fetchOptions.use_index) && Array.isArray(fetchOptions.selector.$and)){
        fetchOptions.selector.$and.push({_id: {"$gte": null}});
    }*/
    return options;
}


/**** retourne un ensemble des données à partir des options passés en paramètre
 */
export default function getData(options){
    const {fetchOptions,...rest} = getFetchDataOptions(options);
    const context = this && typeof this.put =='function' && typeof this.get =="function" && typeof this.allDocs =='function' ? this : null;
    if(context){
        return getDataWithPouchInstance(context,fetchOptions);
    }
    return getDB(rest).then(({db})=>getDataWithPouchInstance(db,fetchOptions));
}

const getDataWithPouchInstance = (db,fetchOptions) =>{
    return new Promise((resolve,reject)=>{
        return db.find(fetchOptions).then(({docs})=>{
            resolve(docs);
        }).catch(e=>{
            if(e?.status === 404 && isNonNullString(fetchOptions.use_index)){
                return db.createDefaultIndexes().finally(d=>{
                    delete fetchOptions.use_index;
                    return db.find(fetchOptions).then(({docs})=>{
                        resolve(docs);
                    }).catch(reject);
                });
            }  
            reject(e);
        });
    })
};

PouchDB.plugin({
    getData,
    fetchData : getData,
});