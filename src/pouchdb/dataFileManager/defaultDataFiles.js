// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import {extendObj} from "$cutils";

import isValidDataFile from "./isValidDataFile";

const defaultDataFiles = {
    common_db : {
        code : 'common_db',
        label: 'Données communes',
        type : 'common',
        common : 1,
        archivable : 0,
        archived : 0,
        removable : 0, //si le fichier de données peut être supprimée,
        system : true, //si c'est un fichier de données système
        desc : "Les données communes à la société à l'instart des dépôts de stockages,des caisses, des contacts sont stockés dans ce fichier"
    },
    users : {
        code : 'users',
        label : "Utilisateurs",
        type : "common",
        common : true,
        archivable : false,
        archived : false,
        removable : false,
        system : true,
        desc : "La base de données des utilisateurs de l'application, permet de manipuler les utilisateurs de l'application",
    }
};


/*** permet d'étendre les fichiers de données par défaut
 * @param {object|Array} liste des functions d'aggregation supplémentaires, de la forme 
 *  {
 *      code {string} le code du fichier de données
 *      label {string} le libele du dataFile
 * }
*/
export function extendDefaultDataFiles(dataFiles){
    Object.map(dataFiles,(dF)=>{
        if(!isValidDataFile(dF)) return null;
        defaultDataFiles[dF.code] = extendObj({},defaultDataFiles[dF.code],dF);
    });
    return defaultDataFiles;
}



export default defaultDataFiles;