// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import {isNonNullString,isObj} from "$cutils";

const types = {
    seller : {
        code : 'seller',
        label : 'Données commerciales'
    },
    common : {
        code : 'common',
        label : 'Données communes'
    },
    projects : {
        code : 'projects',
        label : 'Projets'
    },
    stocks : {
        code : "stocks",
        type : "stocks",
        label : "Stocks",
    },
};


/*** permet d'étendre les types de fichiers de données
 * @param {object|Array} liste des functions d'aggregation supplémentaires, de la forme 
 *  {
 *      code {string} le code du fichier de données
 *      label {string} le libele du dataFile
 * }
*/
export function extendTypes(_types){
    Object.map(_types,(type)=>{
        if(!isObj(type)||!isNonNullString(type.code) || (!type.label && !type.text)) {
            console.error(type," is not valid data file type");
            return;
        }
        types[type.code] = type;
    });
    return types;
}

export default types;