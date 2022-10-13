import actions from "./actions";
const allActions = {};

[
    /*** liste les données d'un tableau avec les paramètres passés en paramètre */
    "list",
    /**** Affiche le formulaire lié au composant passé en paramètre */
    'show',
    /**** insère ue données dont la table est passée en paramètre  */
    'upsert',
    'remove', //action permettant de supprimer uen données en base,
    'onRemove',//action appelée lorsqu'une données a été supprimée de la base lorsqu'une données a été supprimée de la base
    /**** annulle l'opération d'édition du composant passé en paramètre */
    'cancel',
    /**** affiche le formulaire d'édition ou d'ajout d'une nouvelle donnée de type tableData */
    'showTableData'
].map((action,k)=>{
    allActions[action] =   (componentName) => actions(componentName,action);;
});

export default allActions;

