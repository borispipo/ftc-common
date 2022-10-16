// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

export default {
    common_db : {
        code : 'common_db',
        label: 'Données communes',
        type : 'common',
        archivable : 0,
        archived : 0,
        removable : 0, //si le fichier de données peut être supprimée,
        system : true, //si c'est un fichier de données système
        desc : "Les données communes à la société à l'instart des dépôts de stockages,des caisses, des contacts sont stockés dans ce fichier"
    },
    struct_data : {
        code : 'struct_data',
        label: 'Données de structures',
        archivable : 0,
        archived : 0,
        type : 'common',
        removable : 0, //si le fichier de données peut être supprimée
        system : true, //si c'est un fichier de données système
        desc : "Permet de stocker toutes les données de structures de la société, notemment : les modes de règlements, les conditions de règlements, les civilités, les villes,..."
    },
}