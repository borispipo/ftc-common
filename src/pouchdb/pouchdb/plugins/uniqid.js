// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import DateLib from "$date";
import sanitizeName from "../../dataFileManager/sanitizeName";
/*** uniqid plugin */
/*** 
    permet de générer l'id pour l'objet passé en paramètre
    @param table || data : mixted(string,object) : le nom de la table liée à l'ojet
    @param piece : mixted(string,function) : le prefix à utiliser ou la fonction de rappel
    @param successCb :function, la fonctioin de rappel 
*/
/*** les pièces sont numérotés de façon suivante : 
 *  Les deux premières lettres c'est l'année au format yy
 *  Les deux suivants : c'est le mois
 *  les deux suivants : le jour
 *  les quatres suivants c'est l'heure au format HH:MM
 *  et enfin les secondes au format : ss
 *  si la props piece est une fonction alors elle sera appelée pour générer le champ de type piece
 */

export default function uniqidPouchdbPlugin (args){
    let {dbName,tableName,code,piece,table,data} = defaultObj(args);
    let pieceIdSuffix = DateLib.format(new Date(),"ddmmyy-HHMMssl");
    dbName = sanitizeName(defaultStr(dbName,(this && typeof this.getName =="function" ? this.getName():"")));
    table = defaultVal(table,tableName);
    data = defaultObj(data,table);
    if(isFunction(piece)){
        piece = piece(args);
    } 
    piece = defaultVal(piece,data.piece);
    table = defaultStr(table,tableName,data.table,data.tableName).toUpperCase();
    code = defaultStr(data.code,code).toUpperCase();
    let ret = {table,piece};
    if(isObj(data)){
        if(isNonNullString(data._id)) {
            data._id = ret.id = data._id.toUpperCase();
            return ret;
        } 
    } 
    ret.id = ret.pieceId = pieceIdSuffix;
    return ret;
}