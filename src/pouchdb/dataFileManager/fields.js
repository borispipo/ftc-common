/**** les différentes champs des fichiers de données */
import types from "./types";
export default {
    _id : {
        visibleOnlyOnEditing : true,
        type : "string",
        label : "Id",
    },
    code : {
        label : "Code",
        type : "string",
        readOnlyOnEditing : true,
        primaryKey : true,
    },
    type : {
        type : "select",
        items : types,
        required : true,
        readOnlyOnEditing : true,
        label :"Type",
    },
}