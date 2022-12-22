// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import DateLib from "$date";
import {defaultObj,isNonNullString,isPromise,defaultStr} from "$cutils";
import {getLoggedUser} from "$cauth/utils/session"

/*** uniqid plugin */
/*** 
    permet de générer l'id pour l'objet passé en paramètre
    @param table | tableName(string) : le nom de la table liée à l'ojet
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
export const uniqIdDateFormat = "ddmmyy-HHMMssl"

/****
 * @fonction uniqueID permet de générer un unique id des données à insérer en base de données
 * @param {object} args de la forme
 * {
 *      tableName | table {string} le nom de la table data
 *      pieceIdSuffix {string|boolean} le suiffix à ajouter à la bd
 *      withUserPiece {boolean} si prefix de génération des pièces associé au code utilisateur sera rajouté
 *      PIECES {object} l'ensemble des pièces vers où chercher la fonction de génération de la piece, en fonction de le prop piece passée en paramètre
 *      piece {string},required l'élément de base à utiliser pour la génération de la piece
 * }
 * @return {Promise<string>} l'id généré lorsque la promesse est résolue
 */
export const uniqid = (args)=>{
    let {tableName,pieceIdSuffix,onSuccess,PIECES,withUserPiece,piece,table,...rest} = defaultObj(args);
    const pieceIdSuffixDateFormat = defaultStr(appConfig.get("pieceIdSuffixDateFormat"),uniqIdDateFormat)
    PIECES = defaultObj(PIECES);
    rest.pieceSuffix = pieceIdSuffix = pieceIdSuffix === false ? "" : defaultStr(pieceIdSuffix,new Date().toFormat(pieceIdSuffixDateFormat));
    rest.table = defaultStr(table,tableName).trim().toUpperCase();
    return new Promise((resolve,reject)=>{
        const cb = ()=>{
            piece = defaultStr(piece).toUpperCase();
            if((piece)) {
                const _p = PIECES[piece] || PIECES[piece.toLowerCase()] || piece;
                if(isNonNullString(_p)){
                    piece = _p.toUpperCase();
                } else if(isObj(_p)){
                    piece = defaultStr(_p.piece,piece).toUpperCase();
                }
                if(withUserPiece !== false){
                    const userCode = defaultStr(defaultObj(getLoggedUser()).piece).toUpperCase().rtrim("/").ltrim("/");
                    if((userCode)){
                        piece = piece.rtrim("/")+"-"+userCode+"/".toUpperCase();
                    }
                }
                if(typeof onSuccess =='function'){
                    onSuccess({id:piece,suffix:pieceSuffix,pieceSuffix});
                }
                resolve(piece+pieceIdSuffix);
            } else {
                reject({message:'Valeur de la pièce invalide. la valeur de la pièce est non définie. Vous devez spécifier une valeur de la pièce, racine pour la génération du numéro de pièce'})
            }
        }
        if(typeof(piece) =='function'){
            piece = piece(rest);
            if(isPromise(piece)){
                return piece.then(cb).catch(reject);
            }
        } 
        return cb();
    })
    
}