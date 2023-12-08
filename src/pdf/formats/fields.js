import formats from "./formats";
import defaultPageFormat from "./defaultPageFormat";
import defaultPageOrientation from "./defaultPageOrientation";
import appConfig from "$capp/config";

export const LOGO_WIDTH = 100;

export default {
    code : {
        label : 'Code du format',
        required : true,
        maxLength : 20
    },
    label : {
        text : "Intitulé du format",
        maxLength : 40
    },
    displayLogo : {
        text : 'Afficher le logo société',
        type : 'switch',
        defaultValue : 1,
        checkedTooltip : 'Oui',
        uncheckedTooltip : 'Non',
    },
    logoWidth : {
        text : 'Largeur du logo',
        defaultValue : LOGO_WIDTH,
        type : "number",
    },
    footerNote : {
        text : 'Note de bas de page',
        format : 'hashtag',
        maxLength : 500,
    },
    footerCopyRight : {
        text : 'Pied de page/Copyright',
        format : 'hashtag',
        maxLength : 500,
        defaultValue : appConfig.copyright,
    },
    signatoriesMargin : {
        type : "number",
        label : "Marge pour Signataire",
        tooltip : "Veuillez spécifier le nombre de ligne à laisser comme marge (nécessaire pour que chaque signataire puisse signer convenablement) s'il y en a des signataires",
        defaultValue : 2,
    },
    maxCreatedSignaturePrintSize : {
        type : "number",
        defaultValue : 50,
        label : "Taille de la signature image",
        tooltip : "Veuillez spécifier la taille maximale de la signature à apposée lorsqu'il s'agit d'une image enregistrée en signature",
    },
    pageFormat : {
        text : 'Format de la page',
        defaultValue : defaultPageFormat,
        type : 'select',
        items : formats,
        required : true,
        multiple : false,
        itemValue : ({item})=>{
            return formats[item] || item;
        }
    },
    pageWidth : {
        text : 'Largeur de la page en pts(pt)',
        tooltip : 'Spécifiez une valeur de la largeur de la page à imprimer, si cette valeur vaut zéro, la valeur du format de la page sera utilisée',
        defaultValue : 0,
        type : 'number',
        format : 'number',
        validType : 'decimal',
    }, 
    pageHeight : {
        text : 'Hauteur de la page en pts(pt)',
        tooltip : 'Spécifiez une valeur de la hauteur de la page à imprimer, si cette valeur vaut zéro, la valeur du format de la page sera utilisée',
        defaultValue : 0,
        type : 'number',
        format : 'number',
        validType : 'decimal',
    }, 
    pageOrientation : {
        text : 'Orientation de la page',
        type : 'select',
        items : [{code:'portrait',label:'Portrait'},{code:'landscape',label:'Paysage'}],
        defaultValue : defaultPageOrientation,
        required : true,
    },
    leftMargin : {
        type : 'number',
        format : 'number',
        validType : 'number',
        text : 'Marge [Gauche]',
        defaultValue : 20
    },
    topMargin : {
        type : 'number',
        format : 'number',
        validType : 'number',
        text : 'Marge [Haut]',
        defaultValue : 20,
    },
    rightMargin : {
        type : 'number',
        text : 'Marge [Droite]',
        validType : 'number',
        defaultValue : 20
    },
    bottomMargin : {
        type : 'number',
        format : 'number',
        validType : 'number',
        text : 'Marge [Bas]',
        defaultValue : 30
    },
}
