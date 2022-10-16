// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import getAllDefault from "./getAllDefault";
import getDB from "$cdatabase/getDB";
import dbName from "./dbName";
import APP from "$capp/instance";
import {set as setDataFiles} from "./DATA_FILES";
import docId from "./docId";
import isValid from "./isValidDataFile";

/**** actualise la liste des fichiers de données pris en compte par l'application et la stocke en memoire */
export default function fetchDataFiles(){
    const dataFiles = getAllDefault();
    return getDB(dbName).then(({db})=>{
        APP.DEVICE.pouchdbAdapter = db.adapter
        return db.get(docId).then((dFiles)=>{
            Object.map(dFiles,(dF,i)=>{
                if(isValid(dF,i)){
                    dataFiles[dF.code] = extendObj(true,{},dataFiles[dF.code],dF);
                }
            });
            setDataFiles(dataFiles);
            if(APP.getStorageUsage){
                APP.getStorageUsage();
            }
            return dataFiles;
        });
    }).catch((e)=>{
        if(e && e.status == 404) return undefined;
        setDataFiles(dataFiles);
        console.log(e,' fetching data files in databases');
        return e;
    })
}