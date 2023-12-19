import {defaultObj,isNonNullString,defaultStr} from "$cutils";
import { createPageHeader,createSignatories,textToObject,printTags,getPrintedDate,getPageSize} from "./utils";
/*** cette fonction prend en paramètre un tableau de donnés ou un objet à imprimer
    *  @param data {ArrayOf[object]|| object} les/la données à imprimer.
    *  lorsque data est un tableau, alors il s'agit de l'impression cumulée de plusieurs document
    *  lorsque data est un objet, alors il s'agit de l'impression d'une données de ventes
       @param {Array|Object} data : tableau d'objet de données, ou objet document à igenerateQRCodemprimer
    *  @param arg {object
    *       print : La méthode de rappel appelée pour l'impression d'un document
            showPreloader : {function}, la fonction permettant d'afficher le preloader
            hidePreloader : {function}, la fonction permettant de masquer le preloader
            getSettings {()=><Promise<{
                duplicateDocOnPage : {boolean}, si chaque document sera dupliqué sur deux pages
                pageMarginAfterEachDoc {number[2]}, le nombre de ligne à ajouter comme marge après chaque document, ceci est valide uniquement lorsque pageBreakBeforeEachDoc est à false
                pageBreakBeforeEachDoc {boolean}, s'il y aura un break de page après chaque document
                printTitle {string}, le titre que portera le document imprimé
                title {string}, le titre du document imprimé
                generateQRCode {boolean}, si le qrCode sera inclutd dans le résultat
                qrCodeAlignment {string(left|right|top|bottom)}, l'alignement du qrCode
                footerNote {mixted}, la note de pied de page à afficher après chaque document
                footerNoteFontSize {number}, la taille de la police de la note de pied de page
                displayPrintedDate {boolean}, si la date de tirage sera affichée
                printedDateFontSize {number}, la taille de la police de la date d'impression
                tags {Array<string>}, les étiquettes à imprimer sur le document
                printSignatoriesImages : {boolean}, si les signatures images seront affichées
                signatories {Array<{
                    image {dataURL}, l'image au format data url,
                    label|text|code {string}, le texte à afficher avant la signature
                }>}
                footerCopyRight : Le contenu de pied de page
                footerCopyRightColor {string}, la couleur du footerCopyRight
            }>>}, la fonction permettant de récupérer les paramètres lié à l'impression du document
    *       ...rest : les options d'impression du document
    * } : les options d'impression
    * 
    */
export default function (data,options){
    options = Object.assign({},options);
    let {print,getSettings,showPreloader,hidePreloader, ...printOptions} = options;
    showPreloader = typeof showPreloader =='function'? showPreloader : x=>true;
    hidePreloader = typeof hidePreloader =='function'? hidePreloader : x=>true;
    return new Promise((resolve,reject)=>{
        print = typeof print =='function'? print : (args)=>{
            return Promise.resolve(args);
        };
        getSettings = typeof getSettings == 'function' ? getSettings : (opts)=>opts;
        if(!Array.isArray(data)){
            data = [defaultObj(data)];
        } 
        let allData = data;
        const multiple = allData.length > 1;
        return Promise.resolve(getSettings({...printOptions,multiple,allData,data})).then(({pageBreakBeforeEachDoc,pageMarginAfterEachDoc,data:cData,printTitle,generateQRCode,footerNote,title,duplicateDocOnPage,qrCodeAlignment,tags,signatories,...rest})=>{
            let restFileName = defaultStr(rest.fileName);
            pageMarginAfterEachDoc = typeof pageMarginAfterEachDoc =='number'? Math.ceil(pageMarginAfterEachDoc) : 2;
            let pageMarginAf = "";
            for(let i=0;i<pageMarginAfterEachDoc;i++){
                pageMarginAf+="\n";
            }
            if(isNonNullString(footerNote)){
                footerNote = {text:textToObject(footerNote,{fontSize:typeof(footerNoteFontSize) =='number'? footerNoteFontSize: 11})};
            } else if(!Object.size(footerNote,true)){
                footerNote = null;
            }
            printOptions = {...printOptions,showPreloader,hidePreloader,duplicateDocOnPage,...rest};
            const pageSizes = getPageSize(printOptions);
            const pageHeader = createPageHeader(options);
            if(!qrCodeAlignment || !["left","center","right"].includes(qrCodeAlignment)){
                qrCodeAlignment = "left";
            }
            let countD = 0;
            showPreloader("Impression en cours ...");
            const promises = [];
            const allContents = [];
            if(duplicateDocOnPage){
                const ds = [];
                allData.map((data)=>{
                    if(isObj(data) && Object.size(data,true)){
                        ds.push(data);
                        ds.push(data);
                    }
                });
                allData = data = ds;
            }
            for(let i in allData){
                if(isObj(allData[i]) && Object.size(allData[i],true)){
                    countD++
                    const p = Promise.resolve(print({...rest,...pageSizes,multiple:!!(multiple||duplicateDocOnPage),data:allData[i],printTitle:allData[i].code+"-"+(allData.length-1)+"documents"}));
                    promises.push(p);
                }
            }
            let counter = 0;
            const printedDateStr = getPrintedDate(printOptions);
            return Promise.all(promises).then((results)=>{
                for(let i in results){
                    const result = results[i];
                    let qrCode = null//generate(results[i].data);
                    //qrCode.alignment = qrCodeAlignment;
                    if(isValidPrintableContent(result)){
                        const {content} = result;
                        let {footerNote:resultFooter} = result;
                        counter ++;
                        const pHeader = result.pageHeader ? createPageHeader({...printOptions,...result}) : null;
                        if(pHeader && Object.size(pHeader,true)){
                            content.unshift(pHeader);
                        } else if(pageHeader && Object.size(pageHeader,true)){
                            content.unshift(pageHeader);
                        }
                        if(resultFooter){
                            if(isNonNullString(resultFooter)){
                                resultFooter = {text:textToObject(resultFooter,{fontSize:typeof(footerNoteFontSize) =='number'? footerNoteFontSize: 11})};
                            } else if(!Object.size(resultFooter,true)){
                                resultFooter = null;
                            }
                        }
                        if(resultFooter){
                            content.push(resultFooter);
                        } else if(footerNote){
                            content.push(footerNote);
                        }
                        if(printedDateStr){
                            content.push(printedDateStr);
                        }
                        const tagsA = Array.isArray(result.tags)? result.tags : tags;
                        if(Array.isArray(tagsA) && tagsA.length){
                            const pTag = printTags(tagsA,printOptions);
                            if(pTag){
                                content.push(pTag);
                            }
                        }
                        let sign = createSignatories(Array.isArray(result.signatories)? result.signatories : signatories,printOptions);
                        if(sign){
                            content.push(sign);
                        }
                        if(generateQRCode && isNonNullString(qrCode.qr)){
                            content.push(qrCode);
                        }
                        if(!pageBreakBeforeEachDoc){
                            if(counter < results.length){
                                content.push({text:pageMarginAf});
                            } 
                        } else if(counter > 1){
                            //saut de page suite à une nouveau pd
                            allContents.push({text:'',pageBreak: 'before'}); 
                        }
                        if(isNonNullString(result.fileName)){
                            restFileName = `${isNonNullString(restFileName)? (restFileName+"-"):''}${result.fileName}`; 
                        }
                        allContents.push(content);
                    }
                }
                const fileName = defaultStr(restFileName,options.fileName) + (countD-1>0? (`${fileName}? "-et-":""`+(countD-1)+"-documents"):"");
                hidePreloader();
                resolve({...printOptions,content:allContents,fileName,printTitle:defaultStr(printTitle,fileName)})
            }).catch((e)=>{
                reject(e);
                hidePreloader();
                console.log(e,' printing all database data')
            });
        })
    })
 };
 
export const isValidPrintableContent = (printContent)=>{
    if(!isObj(printContent)) return false;
    const {content} = printContent;
    return !!(Array.isArray(content));
}