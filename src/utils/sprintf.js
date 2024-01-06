// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import isNonNullString from "./isNonNullString";
import extendObj from "./extendObj";
/*** cette fonction prend en paramètre une chaine de caractère et échape certains motifs  
 *  les motifs à remplacer sont de la forme : {motif}, mis entre crochet
 *  exemple le motif {date} : est remplacé par la date courante dans la chaine de caractère
 *  sprintf("Lundi je serais à midi à {time}") => Lundi je serais à midi 14:55:22 si l'heure courante c'est 14h 55 min 22 seconde 
 * 
*/
export default function sprintf(string,patterns){
    if(!isNonNullString(string)) return "";
    const _partterns = extendObj({},{
        ///la date actuelle à remplacer dans une chaine de caractère
     '&date&' : (str) => new Date().format("dd/mm/yyyy"),
     '&heure&' : (str) => new Date().format("HH:MM:ss"),  
     '&dateheure&' :  dateTime,
     '&jour&' : day,
     '&mois&' : month,
    },patterns);
    Object.map(_partterns,(p,i)=>{
         let idx = i;
         let val = isFunction(p)? p(string,i): p;
         if(typeof val == 'string') string = string.replaceAll(idx,val).replaceAll(idx.toUpperCase(),val);
    })
    return string;
 }

 const dateTime = (str)=> new Date().format("dd/mm/yyyy HH:MM:ss");
 const day = ()=>new Date().format("dd");
 const month = ()=>new Date().format("dd");