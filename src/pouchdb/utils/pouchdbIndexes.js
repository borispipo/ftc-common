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

export default {
    get,set
};