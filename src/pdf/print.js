import {defaultObj,isNonNullString,defaultStr} from "$cutils";
import { createPageHeader,printSignatories,textToObject,printTags} from "./utils";
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
    let {print,getSettings,showPreloader,hidePreloader, ...rest} = options;
    showPreloader = typeof showPreloader =='function'? showPreloader : x=>true;
    hidePreloader = typeof hidePreloader =='function'? hidePreloader : x=>true;
    let printOptions = {...options,showPreloader,hidePreloader};
    return new Promise((resolve,reject)=>{
        print = typeof print =='function'? print : (args)=>{
            resolve(args);
        };
        getSettings = typeof getSettings == 'function' ? getSettings : (opts)=>opts;
        if(!Array.isArray(data)){
            data = [defaultObj(data)];
        } 
        return Promise.resolve(getSettings(rest)).then(({
            pageBreakBeforeEachDoc,data:cData,printTitle,generateQRCode,footerNote,title,duplicateDocOnPage,qrCodeAlignment,tags,signatories,...rest})=>{
            if(isNonNullString(footerNote)){
                footerNote = {text:textToObject(footerNote,{fontSize:typeof(footerNoteFontSize) =='number'? footerNoteFontSize: 11})};
            } else if(!isObj(footerNote)){
                footerNote = null;
            }
            printOptions = {...printOptions,...rest};
            const pageHeader = createPageHeader(options);
            const allData = data;
            const multiple = allData.length > 1;
            if(!qrCodeAlignment || !["left","center","right"].includes(qrCodeAlignment)){
                qrCodeAlignment = "left";
            }
            let countD = 0;
            showPreloader("Impression en cours ...");
            const promises = [];
            const allContents = [];
            for(let i in allData){
                if(isObj(allData[i]) && Object.size(allData[i],true)){
                    countD++
                    const p = Promise.resolve(print({...rest,multiple,data:allData[i],printTitle:allData[i].code+"-"+(allData.length-1)+"documents"})).then((content)=>{
                        return {content,data:allData[i]}
                    });
                    promises.push(p);
                    if(duplicateDocOnPage){
                        promises.push(p);
                        countD++;
                    }
                }
            }
            let counter = 0;
            return Promise.all(promises).then((results)=>{
                for(let i in results){
                    const {content} = results[i];
                    let qrCode = null//generate(results[i].data);
                    //qrCode.alignment = qrCodeAlignment;
                    if(isValidPrintableContent(content)){
                        counter ++;
                        if(pageHeader && (Array.isArray(pageHeader) && pageHeader.length || Object.size(pageHeader,true))){
                            content.unshift(pageHeader);
                        }
                        if(footerNote){
                            content.push(footerNote);
                        }
                        const printedDateStr = getPrintedDate(printOptions);
                        if(printedDateStr){
                            content.push(printedDateStr);
                        }
                        if(Array.isArray(tags) && tags.length){
                            const pTag = printTags(tags,printOptions);
                            if(pTag){
                                content.push(pTag);
                            }
                        }
                        let sign = printSignatories(signatories,printOptions);
                        if(sign){
                            content.push(sign);
                        }
                        if(generateQRCode && isNonNullString(qrCode.qr)){
                            content.push(qrCode);
                        }
                        if(counter > 1 && pageBreakBeforeEachDoc){
                            //saut de page suite à une nouveau pd
                            allContents.push({text:'',pageBreak: 'before'});
                        } else if(counter > 1){
                            allContents.push({text:'\n\n'});
                        }
                        allContents.push(content);
                    }
                }
                const fileName = defaultStr(rest.fileName,options.fileName) + (countD-1>0? ("-et-"+(countD-1)+"-documents"):"");
                hidePreloader();
                resolve({content:allContents,options:printOptions,fileName,printTitle:defaultStr(printTitle,fileName)})
            }).catch((e)=>{
                resolve({status:false,error:e});
                hidePreloader();
                console.log(e,' printing all database data')
            });
        })
    })
 };
 
export const isValidPrintableContent = (content)=>{
    return !!(Array.isArray(args.content) && content.length);
}