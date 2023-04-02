import defaultDataFiles from "../../dataFileManager/defaultDataFiles";
import {getTypes} from "../../dataFileManager/types";
import { getAll } from "../../dataFileManager/utils";
const syncDataTimeoutTitle = 'Les données dont les dates de création système, sont supérieure à la valeur sélectionnée seront supprimées, Renseignez une valeur nulle ou zero, pour éviter la suppression des données';
export default {
    localForComputer : {
        type :'switch',
        text: 'Local au poste',
        disabledOnEditing : true,
        defaultValue : 1,
        checkedTooltip:'Oui',
        uncheckedTooltip : 'Non',
        onValidate : ({value,context})=>{
            if(context){
                let c = context.getField("oldDocsSince");
                if(c){
                    if(value) c.enable();
                    else c.disable();
                }
            }
        }
    },
    type : {
        type :'select',
        text :'Type',
        defaultValue : 'couchdb',
        disabled : true,
        items : [{code:'couchdb',label:'Cloudant'}],
    },
    _id : {
        primaryKey : true,
        text : 'Code',
        required : true,
        maxLength : 20
    },
    url : {
        text : 'URL',
        required : true,
        validType : 'url'
    },
    status : {
        text : 'Statut',
        type : 'switch',
        checkedLabel : 'Actif',
        uncheckedLabel : 'Inactif',
        defaultValue : 1,
    },
    local : {
        text : 'Accessible sans internet?',
        type:'switch',
        checkedTooltip:'Oui',
        uncheckedTooltip : 'Non',
        defaultValue : 0,
    },
    syncDataTypes : {
        type :'select',
        defaultValue : Object.keys(defaultDataFiles),
        multiple : true,
        required : true,
        text : 'Synchroniser les types de données',
        items : getTypes,
        itemValue : ({item,index})=>item.code,
    },
    databases :{
        text : 'Fichiers de données à synchroniser',
        tooltip : 'Si vous sélectionnez une liste de bases alors seule la liste des bases concernées seront synchronisées.',
        type : 'select',
        multiple:true,
        items : getAll,
    },
    username : {
        text : 'Nom d\'utilisateur',
    },
    password : {
        text : 'Mot de pass de connexion',
        type : 'password'
    },
    timeout : {
        text : "Délai d'attente (ms)",
        type : "number",
        format : "number",
        defaultValue : 0,
        title : "Il s'agit par défaut de la même valeur que celle du délai d'attente de l'opération d'exécution des tâches d'arrières plan. Spécifiez la valeur 0 ou négative, si vous souhaitez utiliser le délai d'attente des tâches d'arrière plan au cas contraire, ce serveur sera synchronisé uniquement lorsque ce délai, comparé à la date de dernière exécution de l'opération de synchronisation sera atteint"
    },
    label : {
        text : 'Description',
        maxLength : 60
    },
    oldDocsSince : {
        type : 'number',
        format : 'number',
        title : syncDataTimeoutTitle,
        text : 'Suppr les données archivées, anciennes de',
        defaultValue : 0,
        validType : 'numberGreaterThanOrEquals[0]',
    },
    compactDB : {
        text : "Compacter les BD après suppression des anciennes données archivées",
        defaultValue : 0,
        type :"switch"
    },
}