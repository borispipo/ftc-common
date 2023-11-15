import {defaultObj,isNonNullString,defaultStr} from "$cutils";
/*** cette fonction prend en paramètre un tableau de donnés ou un objet à imprimer
    *  @param data {ArrayOf[object]|| object} les/la données à imprimer.
    *  lorsque data est un tableau, alors il s'agit de l'impression cumulée de plusieurs document
    *  lorsque data est un objet, alors il s'agit de l'impression d'une données de ventes
       @param {Array|Object} data : tableau d'objet de données, ou objet document à imprimer
    *  @param arg {object
    *       print : La méthode de rappel appelée pour l'impression d'un document
    *       ...rest : les options d'impression du document
    * } : les options d'impression
    * 
    */
export default function (data,options){
    options = Object.assign({},options);
    let {print, ...rest} = options;
    return new Promise((resolve,reject)=>{
        print = defaultFunc(print,(args)=>{
            resolve(args);
        });
        let printTitle = defaultStr(rest.printTitle,rest.docTitle,rest.title);
        let multiple = false;
        if(isArray(data)){
             multiple = data.length > 1? true : false;
             if(multiple === false){
                 data = data[0];
             }
        }
        if(!multiple){ 
           data = defaultObj(data);
        }
        const allData = data;
        if(settingsArgs.printInExcelDocument){
            hidePreloader();
            settingsArgs.format = "excel";
            settingsArgs.printTB = printTB;
            settingsArgs.data = settingsArgs.allData = data;
            return print(settingsArgs)
        }
        let {pageBreakBeforeEachDoc,...rest} = settingsArgs;
        rest = defaultObj(rest)
        delete rest.data;
        let duplicateDocOnPage = rest.duplicateDocOnPage;
        if(duplicateDocOnPage){
            let ds = [];
            if(multiple){
                for(let i in allData){
                    if(isDocUpdate(allData[i])){
                        ds.push(allData[i]);
                        ds.push(allData[i]);
                    }
                }
            } else ds = [data,data];
            allData = ds;
            multiple = true;
        }
        printTitle = defaultStr(printTitle,rest.printTitle,rest.docTitle);
        let printingFooterNote = rest.printingFooterNote ? rest.printingFooterNote : undefined;
        if(printingFooterNote){
            printingFooterNote = require("./textToObject")(APP.sprintf(printingFooterNote));
            printingFooterNote = {
                text : printingFooterNote,
                fontSize: isNumber(rest.printingFooterNoteFontSize)? rest.printingFooterNoteFontSize: 11,
                //italics : true
            }
            if(MDColors.isValidColor(rest.printingFooterNoteTextColor)){
                printingFooterNote.color = rest.printingFooterNoteTextColor;
            }
        }
        let includeQRCode = rest.qrCodeInResult;
        let qrCodeAlignment = defaultStr(rest.qrCodeAlignment).toLowerCase();
        if(!arrayValueExists(["left","center","right"],qrCodeAlignment)){
            qrCodeAlignment = "left";
        }
        let fileName = "";
        let countD = 0;
        if(multiple){
            showPreloader("Impression en cours ...");
            let promises = [];
            let allContents = [];
            let pageBreakBefores = []
            let backgrounds = undefined;
            let allDocDef = {}
            for(let i in allData){
                if(isDocUpdate(allData[i])){
                    let p = print({...rest,multiple,data:allData[i],printTitle:allData[i].code+"-"+(allData.length-1)+"documents"});
                    if(isPromise(p)){        
                        fileName = defaultStr(fileName,allData[i].code)
                        countD++
                        promises.push(p.then((r)=>{
                            return {result:r,data:allData[i]}
                        }));
                    } else if(isValidPrintableContent(p)){
                        fileName = defaultStr(fileName,allData[i].code)
                        countD++
                        promises.push(Promise.resolve({result:p,data:allData[i]}));
                    }
                }
            }
            let counter = 0;
            return Promise.all(promises).then((results)=>{
                for(let i in results){
                    let result = results[i].result;
                    let qrCode = generate(results[i].data);
                    qrCode.alignment = qrCodeAlignment;
                    if(isValidPrintableContent(result)){
                        let {docDefinition,content,options}= result;
                        counter ++;
                        if(isArray(result.content)){
                            if(printingFooterNote){
                                result.content.push(printingFooterNote);
                            }
                            let printedDateStr = printTB.getPrintedDate(settingsArgs);
                            if(printedDateStr){
                                result.content.push(printedDateStr);
                            }
                            let printingTags = printTB.printingTags(settingsArgs.printingTags,settingsArgs);
                            if(printingTags){
                                result.content.push(printingTags);
                            }
                            let sign = printTB.signatories(settingsArgs.signatories,settingsArgs,{duplicateDocOnPage});
                            if(sign){
                                result.content.push(sign);
                            }
                            
                            
                            if(includeQRCode && isNonNullString(qrCode.qr)){
                                result.content.push(qrCode);
                            }
                        }
                        /*if(duplicateDocOnPage && counter%2 == 1){
                            result.content.push({text:DUPLICATE_TEXT_CONTENT, color:"white",id:DUPLICATE_TEXT_CONTENT+"-"+counter})
                        }*/
                        if(counter > 1 && pageBreakBeforeEachDoc){
                            //saut de page suite à une nouveau pd
                            allContents.push({text:'',pageBreak: 'before'});
                        } else if(counter > 1){
                            allContents.push({text:'\n\n'});
                        }
                        allContents.push(result.content);
                        if(isFunction(docDefinition.pageBreakBefore)){
                            pageBreakBefores.push(docDefinition.pageBreakBefore.bind({},options));
                        }
                        if(typeof backgrounds !== 'function'){
                            backgrounds = isFunction(docDefinition.background)? docDefinition.background : result.background;
                        }
                        APP.extend (allDocDef,docDefinition);
                    }
                }
                allDocDef.pageBreakBefore = printTB.pageBreakBefore((args)=>{
                    for( let i in pageBreakBefores){
                        if(pageBreakBefores[i]() === true) return true;
                    }
                    return false;
                });
                if(isFunction(backgrounds)){
                    allDocDef.background = (currentPage, pageSize)=>{
                        return backgrounds({pageSize,currentPage,multiple,counter,pageBreak:pageBreakBeforeEachDoc,allData,settings:settingsArgs});
                    };
                }
                let docDef = {data,printTitle,content:allContents,docDefinition:allDocDef,options:rest}
                delete docDef.success;delete docDef.resolve; delete docDef.error; delete docDef.reject;
                docDef.success = ((args)=>{
                    resolve(args);
                    hidePreloader();
                });
                docDef.error = ((e)=>{
                    reject(e);
                    hidePreloader();
                });
                docDef.multiple = multiple;
                fileName+= (countD-1>0? ("-et-"+(countD-1)+"-documents"):"");
                docDef.fileName = defaultStr(docDef.fileName,rest.fileName,fileName);
                docDef.printTitle = defaultStr(docDef.printTitle,fileName)
                createPDFFile (docDef)
            }).catch((e)=>{
                resolve({status:false,error:e});
                hidePreloader();
                console.log(e,' printing all database data')
            });
        }
        allData = [data];
        let p = print({...rest,multiple,data,allData})
        if(isValidPrintableContent(p)){
            p = Promise.resolve(p);
        }
        if(isPromise(p)){     
            showPreloader("Impression en cours ...");
            p.then((args)=>{
                let printedDateStr = printTB.getPrintedDate(settingsArgs);
                let docDef = {...args,data,printTitle};
                docDef.docDefinition = defaultObj(docDef.docDefinition);
                let {background} = docDef;
                args = defaultObj(args);
                background = isFunction(background)? background : args.background;
                docDef.fileName = defaultStr(docDef.fileName,rest.fileName,data.code);
                delete docDef.success;delete docDef.resolve; delete docDef.error; delete docDef.reject;
                if(isArray(docDef.content)){
                    if(printingFooterNote){
                        docDef.content.push(printingFooterNote);
                    }
                    if(printedDateStr){
                        docDef.content.push(printedDateStr);
                    }
                    let printingTags = printTB.printingTags(settingsArgs.printingTags,settingsArgs);
                    if(printingTags){
                        docDef.content.push(printingTags);
                    }
                    let sign = printTB.signatories(settingsArgs.signatories,settingsArgs,{duplicateDocOnPage});
                    if(sign){
                        docDef.content.push(sign);
                    }
                    
                    if(includeQRCode){
                        let qrCode = generate(data);
                        qrCode.alignment = qrCodeAlignment;
                        if(qrCode.qr) docDef.content.push(qrCode);
                    }
                }
                if(isFunction(background)){
                    /**** les paramètres d'impression de l'arrière plan : 
                     *  pageSize : {width,heigh}, la taille de la page courante
                     *  currentPage : le numéro de la page courante
                     *  settings : les paramètres d'impression
                     *  counte : //le nombre de documents à imprimer
                     *  multiple : //s'il s'agit d'une impression multiple
                     */
                    docDef.docDefinition.background = (currentPage, pageSize)=>{
                        return background({pageSize,currentPage,multiple,counter:1,pageBreak:true,allData,settings:settingsArgs});
                    };   
                }
                docDef.success = ((args)=>{
                    resolve(args);
                    hidePreloader();
                });
                docDef.error = ((e)=>{
                    reject(e);
                    hidePreloader();
                });
                
                createPDFFile(docDef)
            }).catch((e)=>{
                console.log(e,' printing document error ',data)
                resolve({status:false,error:e,data});
                hidePreloader();
            })
        } else {
            hidePreloader();
            console.warn("Impossible d'exécuter le fonction print, car la méthode print passé en paramètre ne retourne pas une promesse")
            Promise.resolve({status:false,msg, data })
        }
    })
 };