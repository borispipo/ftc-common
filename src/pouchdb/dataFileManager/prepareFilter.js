// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {isNonNullString,defaultFunc} from "$cutils";
/*** définit le filtre de données à utiliser pour la sélection des fichiers de données
*  @param {func,string} : le filtre des fichiers de données à retourner
   *      - si chaine de caractère : spécifie le type de donées qui sera retournée
   *      - si fonction alors une boucle parcourant l'ensemble des fichiers de données de l'application est passée en paramètre et la fonction est appelée pour filtrer les données à récupérer    
   *      filter : (dF,code,allDBToReturn)
*/
export default function prepareFilter (filter){
   if(isNonNullString(filter)){
       let type = filter.toLowerCase().trim();
       if(type == 'all'){
           filter = (x)=> x;
       } else {
           filter = (x)=> x.type === type ? true : false;
       }
   }
   return defaultFunc(filter,(x)=>true);
}