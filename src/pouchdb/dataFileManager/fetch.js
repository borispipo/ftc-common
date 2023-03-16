// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import getAllDefault from "./getAllDefault";
import APP from "$capp/instance";
import {set as setDataFiles} from "./DATA_FILES";
import isValid from "./isValidDataFile";
import getDB from "./getDB";

/**** actualise la liste des fichiers de données pris en compte par l'application et la stocke en memoire */
export default function fetchDataFiles(){
    const dataFiles = getAllDefault();
    const result = {};
    const removableDataFiles = {};//en principe, toutes les bases de données non supprimables devraient être enregistrées comme fichiers de données
    Object.map(dataFiles,(dF)=>{
        if(!isValid(dF)) return;
        if(!dF.removable){
            removableDataFiles[dF.code] = dF;
        }
    });
    return new Promise((resolve,reject)=>{
        return getDB().then(({db})=>{
            return db.allDocs({include_docs: true}).then(({rows})=>{
                const promises = [];
                const foundedDF = {};
                rows.map(({doc})=>{
                    if(!isValid(doc)) return;
                    const code = doc._id;
                    if(code in removableDataFiles){
                        foundedDF[code] = true;
                    }
                    result[code] = doc;
                });
                Object.map(removableDataFiles,(dF,dFCode)=>{
                    promises.push(
                        db.upsert(dFCode,(n)=>{
                            return dF;
                        }).then(({newDoc})=>{
                            result[dFCode] = newDoc;
                        }).catch((e)=>{
                            result[dFCode] = dF;
                        })
                    )
                });
                return Promise.all(promises).finally(()=>{
                    setDataFiles(result);
                    if(APP.getStorageUsage){
                        APP.getStorageUsage();
                    }
                    resolve(result);
                });
            })
        }).catch((e)=>{
            if(e && e.status == 404) return undefined;
            //setDataFiles(dataFiles);
            console.log(e,' fetching data files in databases');
            return e;
        })
    })
}