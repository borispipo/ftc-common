/**** les différentes champs des fichiers de données */
import {getTypes} from "./types";

export default {
    _id : {
        visibleOnlyOnEditing : true,
        type : "string",
        label : "Id",
        lower : true,
        validType : "dataFileName",
    },
    code : {
        label : "Code",
        type : "string",
        readOnlyOnEditing : true,
        primaryKey : true,
        lower : true,
        required : true,
        validType : "dataFileName"
    },
    type : {
        type : "select",
        items : getTypes,
        required : true,
        readOnlyOnEditing : true,
        label :"Type",
    },
    archivable : {
        type  : "switch",
        label : "Archivable",
    },
}