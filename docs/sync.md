# Pouchdb

La logique de synchronisation qui a été implémentée est la suivante :

1.  On peut synchroniser soit par type de fichier de données, soit spécifier les types de fichiers de données que l'on souhaite synchroniser
2.  Les éléments à synchroniser, qu'il s'agisse des types de fichiers de données ou des fichiers de données doivent être des tableau de la forme
    1.  pour les types : \[ type1##syncDir, type2##syncDir, ….typeN##syncDir\] où syncDir représente pour chaque type la direction de synchronisation
    2.  pour les bases de données :  \[ dbName1##syncDir, dbName2##syncDir, ….dbNameN##syncDir\] où syncDir représente pour chaque type la direction de synchronisation pour chaque nom de base de données
