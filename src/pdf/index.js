import pdfMake from "./pdfmake";
import {isObj,isNonNullString,defaultStr} from "$cutils";
import { pageBreakBefore,createPageFooter,createPageHeader,getPrintedDate,getPageSize,getPageMargins,textToObject,createSignatories} from "./utils";

import printFile from "./print";

export * from "./formats";
export * from "./utils";
export * from "./pdfmake";


/*** permet de créere un pdf à partir de l'utilitaire pdfmake
    @see https://pdfmake.github.io/docs/0.1
    @param {object} docDefinition {
        la définition selon pdfmake
        pageHeader {false|string|array|object}, si false, le header de la page ne sera pas généré
        pageFooter {false|string|array|object}, si false, le footer de la page ne sera pas généré
        signatories {Array<{object}>}, la liste des signataires, générés en bas de page
        printedDate {false}, si la date de tirage sera affichée où non
    }
    @param {object:{createPDF|createPdf}}, en environnement node par example, l'on devra passer une autre fonction createPdf afin que ça marche car sinon une erreur sera générée
*/
export function createPDF(_docDefinition,customPdfMake,...restOptions){
    _docDefinition = Object.assign({},_docDefinition);
    const docDefinition = {..._docDefinition,...getPageSize(_docDefinition)};
    const {content:dContent,pageBreakBefore:pBefore} = docDefinition;
    const content = Array.isArray(dContent)? dContent : isObj(dContent) || isNonNullString(content) ? [dContent] : [];
    docDefinition.pageBreakBefore = pageBreakBefore(pBefore);
    if(docDefinition.pageHeader !== false){
        const pageHeader = createPageHeader(docDefinition);
        if(pageHeader && (Array.isArray(pageHeader) && pageHeader.length || Object.size(pageHeader,true))){
            content.unshift(pageHeader);
        }
    }
    delete docDefinition.pageHeader;
    if(docDefinition.pageFooter !== false && docDefinition.pageFooter){
        docDefinition.pageFooter = Array.isArray(docDefinition.pageFooter) && docDefinition.pageFooter.length && docDefinition.pageFooter || isObj(docDefinition.pageFooter) && Object.size(docDefinition.pageFooter,true) && docDefinition.pageFooter || createPageFooter(docDefinition);
    }
    delete docDefinition.pageFooter;
    
    if(isNonNullString(docDefinition.footerNote)){
        content.push({text:textToObject(docDefinition.footerNote)})
    }
    delete docDefinition.footerNote;
    if(docDefinition.printedDate !== false){
        content.push(getPrintedDate(docDefinition));
    }
    const _sign = Array.isArray(docDefinition.signatories)? docDefinition.signatories : [];
    if(_sign.length && docDefinition.signatories !== false){
        const signatories = createSignatories(_sign);
        if(signatories){
            content.push(signatories);
        }
    }
    delete docDefinition.signatories;
    docDefinition.content = content;
    const createPdf = customPdfMake && typeof customPdfMake?.createPDF =='function'? customPdfMake.createPDF : typeof customPdfMake?.createPdf =='function'? customPdfMake.createPdf : pdfMake.createPdf;
    
    //@see : https://pdfmake.github.io/docs/0.1/document-definition-object/tables
    // The full signature of createPdf looks like this.
    // tableLayouts, fonts and vfs are all optional - falsy values will cause
    // pdfMake.tableLayouts, pdfMake.fonts or pdfMake.vfs to be used.
    //signature: docDefinition,tableLayouts, fonts, vfs
    return createPdf(docDefinition,...restOptions);
};

/*** permet de générer le pdf à partir de la fonction print du fichier ./print
    @param {Array|Object} data, la données où l'ensemble des données à imprimer
    @param {object} options, les options supplémentaires à passer à la fonction print
*/
export const print = (data,options,customPdfMake, ...restOptions)=>{
    return printFile(data,options).then((docDefinition)=>{
        return createPDF({...docDefinition,pageHeader:false,printedDate:false,footerNote:false,signatories:false},customPdfMake, ...restOptions)
    })
}