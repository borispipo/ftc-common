// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

/****alias à la fonction Array.prototype.filter, applique les filtres sur les éléments d'un tableau où d'un object
 * @param {object|Array} objectOrArray l'objet sur lequel appliquer le filtre
 * @param {function(obj,index)} la fonction de filtre a appliquer à l'objet en cours
 * @return {object|Array} l'objet où le tableau sur lequel le filre a été appliqué
 */
export default function ObjectFilter(objectOrArray,filter){
    if(!objectOrArray || typeof objectOrArray !=='object' || typeof filter !=='function') return objectOrArray;
    if(Array.isArray(objectOrArray)){
        return objectOrArray.filter(filter);
    }
    const r = {};
    for(let i in objectOrArray){
        if(filter(objectOrArray[i],i) !== false){
            r[i] = objectOrArray[i];
        }
    }
    return r;
}

Object.filter =  ObjectFilter;