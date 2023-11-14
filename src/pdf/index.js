import pdfMake from "./pdfmake";
import {isObj,isNonNullString,defaultStr} from "$cutils";
import { pageBreakBefore,createPageFooter,createPageHeader,getPageMargins} from "./utils";
import formats from "./formats/formats";
import { defaultPageFormat,defaultPageOrientation } from "./formats";
export * from "./formats";
export * from "./utils";
export * from "./pdfmake";


/*** permet de créere un pdf à partir de l'utilitaire pdfmake
    @see https://pdfmake.github.io/docs/0.1
    @param {object} docDefinition {la définition selon pdfmake}
    @param {object} options, les options supplémentaires permettant de générer le pdf
*/
export function createPDF(docDefinition,options){
    options = Object.assign({},options);
    const {content:dContent} = docDefinition;
    const content = Array.isArray(dContent)? dContent : isObj(dContent) ? [dContent] : [];
    docDefinition = Object.assign({},docDefinition);
    const {pageBreakBefore:pBefore} = docDefinition;
    docDefinition.pageBreakBefore = pageBreakBefore(pBefore||options.pageBreakBefore);
    const pageHeader = createPageHeader(options);
    if(pageHeader && (Array.isArray(pageHeader) && pageHeader.length || Object.size(pageHeader,true))){
        content.unshift(pageHeader);
    }
    docDefinition.footer = Array.isArray(docDefinition.footer) && docDefinition.footer.length && docDefinition.footer || isObj(docDefinition.footer) && Object.size(docDefinition.footer,true) && docDefinition.footer || createPageFooter(options);
    let pageSize = defaultStr(docDefinition.pageSize,options.pageSize,options.pageFormat).trim().toUpperCase();
    if(!pageSize || !formats.includes(pageSize)){
        pageSize = defaultPageFormat;
    }
    let pageOrientation = defaultStr(docDefinition.pageOrientation,options.pageOrientation).toLowerCase().trim();
    if(!pageOrientation || !["landscape",defaultPageOrientation].includes(pageOrientation)){
        pageOrientation = defaultPageOrientation;
    }
    docDefinition.pageSize = pageSize;
    docDefinition.pageOrientation = pageOrientation;
    docDefinition.content = content;
    docDefinition.pageMargins = Array.isArray(docDefinition.pageMargins) && docDefinition.pageMargins.length && docDefinition.pageMargins || getPageMargins(options);
    return pdfMake.createPdf(docDefinition);
};