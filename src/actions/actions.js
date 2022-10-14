import defaultStr from "$cutils/defaultStr";
/**** Les actions sont utiles pour l'écoute des évènement de l'application.
 *    Ils ont pour rôle de prendre en paramètre : 
 *    le nom du composant, puis retourner l'unique action correspondante au type
 *  @param : string componentName : le nom du composant 
 *  @param : string type : le type de l'action 
 *  Exemple : actions('structData','show') => SRUCT_DATA_SHOW : pour afficher un composant StructData
 *            actions('productsCategories','upsert') => PRODUCTS_CATEGORIES_UPSERT : appelée lorsqu'une catégorie de produit est mise à jour
 */
export default function actions(componentName,type){
    type = defaultStr(type);
    if(type){
        type = "_"+type.toUpperCase().trim().ltrim("_");
    }
    componentName = defaultStr(componentName);
    if(componentName){
        return componentName.trim().toSnake().toUpperCase().ltrim("_").rtrim("_")+type;
    }
    return '';
}