Le dataFileManager est le gestionnaire des bases de données pouchdb
Il s'agit d'une base de donnée portant uniquement les informations/meta data relatives aux différentes bases de données pouchdb de l'application
ainsi, tous les documents de la base de données dataFileManager sont les metadata sur les bases de données et lorsqu'on supprime une base de données, 
celle-ci est supprimée du dataFileManager

Elle contient en effet des informations relatives à toutes les bases données où fichiers de données existants où crées par l'application
Au lancement de l'application, le dataFileManager est initialisé tout d'abord à la première action et mise à jour à chaque fois qu'il y ait synchronisation


pour étendres les fichiers de données par défaut, appeler la fonction extendDefaultDataFiles, 
importée du fichier ./defaultDataFiles, cette fonction prend en paramètre un object contenant la lites des fichiers de données
supplémentaires à ajouter;