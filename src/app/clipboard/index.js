
import FormData from "$components/Form/FormData";
import {getFormData as getData} from "$components/Form/utils/FormsManager";
import  {defaultObj,defaultStr,isNonNullString,isObj,uniqid} from "$utils";
///import formatField from "$database/exporter/formatField";
import {open,close} from "$components/Dialog/Provider";
import { COPY_ICON } from '$components/Icon';
import notify from "$notify";
import {copyTextToClipboard} from "./utils";
import {isMobileOrTabletMedia} from "$platform/dimensions";
import session from "$session";
import ScrollView  from "$components/ScrollView";

export * from "./utils";

export const copyToClipboard = (str) => {
    if(typeof str =='number' || typeof str =='boolean'){
        str +="";
    }
    if(isNonNullString(str)){
        return copyTextToClipboard(str);
    } else {
        return selectText2Copy(str);
    }
};


const clipboardFormName = uniqid("clip-board-formname");


let sessionKeyName = sessionName => "cplipboard-copy-"+defaultStr(sessionName);

export const selectText2Copy = (args)=>{
    let {data,fields,sessionName,rowData} = args;
    sessionName = defaultStr(sessionName,'copy-to-clipboard').trim();
    if(isObj(fields)){
        data = defaultObj(data,rowData);
        let formData = {},sessionKey = sessionKeyName(sessionName);
        if(sessionName){
            formData = defaultObj(session.get(sessionKey));
        }
        let keyFields = {}
        let fieldsCounter = 0;
        Object.map(data,(v,i)=>{
            if(!isObj(fields[i])) return null;
            let field = fields[i];
            if(isDecimal(v)){
                v = field.format =="money"? v.formatMoney() :  v.formatNumber();
            }
            //v = defaultStr(formatField({format:"EXCEL",field,formatResult:true,columnField:i,rowData:data}));
            if(isNonNullString(v)){
                let labelText = defaultStr(field.text,field.label);
                fieldsCounter++;
                keyFields[i] = {
                    label : labelText+("="+v),//"["+v+"]",
                    labelText,
                    defaultValue : v,
                    code : i 
                }
            }
        });
        if(fieldsCounter > 0){
            let formFields = {};
            formFields.content = {
                text :'Eléments à copier',
                type : 'select',
                multiple : true,
                required : true,
                items : keyFields,
                itemValue : ({item})=>item.code,
                renderText : ({item})=>item.label,
            }
            formFields.renderType = {
                text : "Copier : ",
                type : "select",
                multiple : false,
                defaultValue : "label+value",
                required : true,
                items : [
                    {code:'label+value',label:"Libelé+valeur"},
                    {code:'value',label:'Valeur uniquement'},
                    {code:'label',label:'Libelé uniquement'}
                ]
            }
            formFields.separator = {
                text : "Séparateur des valeurs",
                defaultValue : "ligne",
                title : 'Ce séparateur est utilisé pour séparer les valeurs/libelés lorsque plusieurs éléments sont sélectionnés.\nSi vous souhaitez utiliser le séparateur retour chariot (nouvelle ligne), veuillez tout simplement entrez un texte contenant [ligne].'
            }
            return new Promise ((resolve,reject)=>{
                return open({
                    dismissable : true,
                    propsMutator : (rest)=>{
                        if(isMobileOrTabletMedia()){
                            rest.maxActions = 1;
                        } else {
                            rest.maxActions = 2;
                        }
                        return rest;
                    },
                    title : "Sélectionnez les éléments à copier",
                    onDismiss : (e)=>{
                        reject({msg : 'Annulé par l\'utilisateur'});
                    },
                    actions : [{
                        icon : COPY_ICON,
                        text : 'Copier',
                        primary : true,
                        onPress : (e)=>{
                            const data = getData(clipboardFormName);
                            if(isObj(data) && isArray(data.content) && data.content.length){
                                data.separator = defaultStr(data.separator,"\n").replaceAll("ligne","\n");
                                let content = data.content.map(v=>{
                                    switch(data.renderType){
                                        case "label+value" : 
                                            return keyFields[v].label;
                                        case "label" : 
                                            return keyFields[v].labelText;
                                        case "value":
                                            return keyFields[v].defaultValue
                                    }
                                    return keyFields[v].label
                                }).join(data.separator);
                                if(isNonNullString(content) && copyToClipboard(content)){
                                    session.set(sessionKey,{renderType:data.renderType})
                                }
                                resolve(data);
                                close();
                            } else {
                                notify.warning("Aucun élément sélectionné")
                            }
                        }
                        },
                    ],
                    responsive : true,
                    children : <>
                        <ScrollView>
                            <FormData
                                formName = {clipboardFormName}
                                data = {formData}
                                fields = {formFields}
                                responsive = {false}
                            />
                        </ScrollView>
                    </>
                })
            })
        }
    }
    return Promise.reject({msg:'champs non définis, impossible de copier l\'objet dans le presse papier'});
}


export default copyToClipboard;