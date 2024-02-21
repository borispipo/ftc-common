Les mangoes queries groupent les requêtes en deux types, les filtres en OR et les filtres en AND. 
    tous les filtres en OR sont mis dans un groupe OR, tous les filtres en AND sont mis dans le groupe AND;
        - Si uniquement 2 champs sont filtrés, l'un en OR et l'autre en AND alors la requête sera (conditionChamp1 OR conditionChamp2)
        - Si au moins 2 champs sont filtrés en OR alors la requête sera ((conditionChampsAnd1 AND conditionChampAnd2, ...conditionChampAndN) AND (conditionsChamps en OR))
        - Si plus d'un champ sont filtrés en OR et au moins un champ est filtré en AND alors la requête sera ((conditionChampsAnd1 AND conditionChampAnd2, ...conditionChampAndN) OR (conditionChamps en OR))
        - Sinon, la requête sera ((conditionChampsAnd1 AND conditionChampAnd2, ...conditionChampAndN) and (conditionsChampOR1 OR conditionsChampO2, ...conditionsChampsOrN))