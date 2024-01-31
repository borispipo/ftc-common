// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import getAllDefault from "./getAllDefault";
import APP from "$capp/instance";
import {set as setDataFiles} from "./DATA_FILES";
import isValid from "./isValidDataFile";
import getDB from "./getDB";

const hasFetchRef = {current:false};
/**** actualise la liste des fichiers de données pris en compte par l'application et la stocke en memoire */
export default function fetchDataFiles(){
    const dataFiles = getAllDefault();
    const result = {};
    const defDataFiles = {};
    //en principe, toutes les bases de données non supprimables devraient être enregistrées comme fichiers de données
    Object.map(dataFiles,(dF)=>{
        if(!isValid(dF)) return;
        if(!dF.removable){
          defDataFiles[dF.code] = dF;
        }
    });
    return new Promise((resolve,reject)=>{
        return getDB().then(({db})=>{
            return db.allDocs({include_docs: true}).then(({rows})=>{
                const promises = [];
                const foundDBS = {};
                rows.map(({doc})=>{
                    if(!isValid(doc)) return;
                    const code = doc._id;
                    if(code in defDataFiles){
                        foundDBS[code] = doc;
                    }
                    result[code] = doc;
                });
                //on force l'insertion en base de données, de tous les fichiers de données à l'exception des fichiers de données supprimables
                Object.map(defDataFiles,(dF,dFCode)=>{
                    if(!foundDBS[dF.code] && !dF.removable){
                        promises.push(
                            db.upsert(dFCode,(n)=>{
                                return dF;
                            }).then(({newDoc})=>{
                                result[dFCode] = newDoc;
                            }).catch((e)=>{
                                result[dFCode] = dF;
                            })
                        )
                    }
                });
                return Promise.all(promises).finally(()=>{
                    setDataFiles(result);
                    APP.trigger(APP.EVENTS.FETCH_POUCHDB_DATA_FILES,result);
                    hasFetchRef.current = true;
                    resolve(result);
                });
            })
        }).catch((e)=>{
            reject(e);
            console.log(e,' fetching data files in databases');
            return e;
        })
    })
}

export const hasFetch = ()=>{
    return hasFetchRef.current;
}

if(typeof window !=='undefined' && window && typeof window.fetchPouchdbDataFiles !=='function'){
    Object.defineProperties(window,{
        fetchPouchdbDataFiles : {
            value : fetchDataFiles,
        }
    })
}