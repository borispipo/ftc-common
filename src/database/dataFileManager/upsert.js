// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import{defaultFunc,isFunction} from "$utils";
import isValid from "./isValidDataFile";
import getDB from "../getDB";
import { getAll } from "./utils";

export const _upsert = (diffFunc)=>{
    let dataFiles = getAll();
    diffFunc= defaultFunc(diffFunc,x=>x)
    return getDB(dbName).then(({db})=>{
        return db.upsert(docId,(newDoc)=>{
            Object.map(newDoc,(dF,i)=>{
                if(isValid(dF,i)){
                    dataFiles[dF.code] = extendObj(true,{},dataFiles[dF.code],dF);
                }
            });
            dataFiles = diffFunc(dataFiles);
            setDataFiles(dataFiles);
            dataFiles.table = table;
            return dataFiles;
        })
    })
}

const upsert = (dF,diffFunc)=>{
    return _upsert((dataFiles)=>{
        if(isValid(dF)){
            dataFiles[dF.code] = extendObj(true,{},dataFiles[dF.code],dF);
        }
        if(isFunction(diffFunc)){
            diffFunc(dataFiles[dF.code]);
        }
        return dataFiles;
    });
};

export default upsert;

