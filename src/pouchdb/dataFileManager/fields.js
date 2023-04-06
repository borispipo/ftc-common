/**** les différentes champs des fichiers de données */
import {getTypes} from "./types";
import table from "./table";

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
        foreignKeyColumn : "_id",
        foreignKeyTable : table,
        primaryKey : true,
        lower : true,
        required : true,
        validType : "dataFileName"
    },
    label : {
        label:"Libelé",
        maxLength : 120,
        required : true,
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
        disabled : args => isObj(args) && isObj(args.data) && !!args.data.system || false,
    },
}