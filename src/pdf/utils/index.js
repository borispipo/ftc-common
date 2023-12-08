import {isObj,isNonNullString,isDataURL,defaultStr,sortBy,isNumber,defaultObj,defaultFunc,isFunction,defaultVal,defaultNumber} from "$cutils";
import theme from "$theme";
import {getLoggedUserCode} from "$cauth/utils/session";
import appConfig from "$capp/config";
import textToObject from "./textToObject";
import Colors from "$theme/colors";
import DateLib from "$clib/date";
import { LOGO_WIDTH } from "../formats/fields";
import outlineText from "./outlineText";
/*permet de créer l'entête des données de type tableau
    @param {Array} tableHeader : l'entte du tableau à créer
    @param {function|object} : les options supplémentaires. is function alors il s'agit de la méthode render par défaut
    lorsque options est un objet, alors il est de la forme : 
    {
        render | renderItem {function({item,index})=><>}
        color {string}, les couleurs d'entête
        fillColor {string}, les couleur d'arrière plan d'entête
    }
*/
export const createTableHeader = (tableHeader,options)=>{
    if(!isObjOrArray(tableHeader)) return [];
    if(isFunction(options)){
        options = {render:options};
    }
    options = defaultObj(options);
    let {renderItem,render,fillColor,color,...rest} = options;
    fillColor = Colors.isValid(fillColor)? fillColor : theme.colors.background;
    color = Colors.isValid(color)? color : theme.colors.text;
    renderItem = isFunction(renderItem)? renderItem : isFunction(render)? render : undefined;
    rest = defaultObj(rest)
    let tH = [];
    Object.map(tableHeader,(e,index)=>{
        if(renderItem){
            if(isObj(e)){
                e = renderItem({...e,item:e,index})
            } else {
                e = renderItem({value:e,item:e,index})
            }   
        }
        if(isNonNullString(e)){
            tH.push(
                {
                    text : e.toUpperCase(),
                    fillColor,
                    color,
                    bold : true,
                    ...rest
                }
            )
        }
    });
    return tH;
}

/**
  @see : https://pdfmake.github.io/docs/0.1/document-definition-object/page/
* @param {function({
    pageWidth,pageCount,
})}, la fonction de rappel à appeler pour passer les paramtères costomisées 
* @param {If pageBreakBefore returns true, a page break will be added before the currentNode. Current node has the following information attached:} currentNode 
* @param {*} followingNodesOnPage 
* @param {*} nodesOnNextPage 
* @param {*} previousNodesOnPage 
*/
export const pageBreakBefore = (cb)=>{
   const pageBreakBefore = defaultFunc(cb);
   return function(currentNode, followingNodesOnPage, nodesOnNextPage, previousNodesOnPage) {
       if(isObj(currentNode.startPosition) && isNonNullString(currentNode.text)){
           return pageBreakBefore({
               ...currentNode.startPosition,
               currentNode,
               followingNodesOnPage, nodesOnNextPage, previousNodesOnPage,
               text : currentNode.text,
               top : defaultNumber(currentNode.startPosition.top),
               pageWidth : currentNode.startPosition.pageInnerWidth,
               left : currentNode.startPosition.left,
               pageHeight : currentNode.startPosition.pageInnerHeight
           })
       }
       return currentNode.headlineLevel === 1 && followingNodesOnPage.length === 0;
   }
};


/**** permet d'évaluer le contenu du pied de page
    permet de créer le footer de la page à générer
     *  @param {
    *      footerCopyRight : Le contenu de pied de page
           footerCopyRightColor {string}, la couleur du footerCopyRight
           showPreloader {function(text)}, la fonction de rappel à utiliser pour afficher la progression en cours de la création du pdf
           hidePreloader {function()}, la fonction appelée pour masquer le preloader
    * }
*/
export const createPageFooter = (opts)=>{
   opts = defaultObj(opts);
   const margin = [10,0,10,10];
   let footerCopyRight = opts.footerCopyRight === false ? "" : defaultVal(opts.footerCopyRight,undefined)
   if(isNonNullString(footerCopyRight)){
       footerCopyRight = {
           text : textToObject(footerCopyRight),
           alignment : "center",
           fontSize:10,
           margin,
           color : Colors.isValid(opts.footerCopyRightColor)? opts.footerCopyRightColor : undefined
       }
   }
   let devWebsite = appConfig.devWebsite;
   const showPreloader = defaultFunc(opts.showPreloader), hidePreloader = defaultFunc(opts.hidePreloader);
   return function(currentPage, pageCount, pageSize) {
       currentPage = defaultNumber(currentPage);
       const currentPageStr = currentPage.formatNumber().toString();
       pageCount = defaultNumber(pageCount);
       showPreloader("page "+currentPage.formatNumber()+"/"+pageCount.formatNumber());
       if(currentPage >=  pageCount){
         setTimeout(hidePreloader,10);
       }
       pageCount = pageCount > 2 ? {
           fontSize: 9,
           width : "140",
           text:[
               {
                   text : '     Page '+currentPageStr + '/' + pageCount.formatNumber(),
                   bold : true,
               },
               {
                   text: ['\n[ powered by ',{text:appConfig.name,link:isValidUrl(devWebsite)? devWebsite:undefined,color:'red'}," ]"],
                   fontSize : 9,
                   italics : true,
                   link : isValidUrl(devWebsite)? devWebsite : undefined
               }
           ],
           margin : [5,0,20,0],
           alignment: 'right'
       } : null;
       if(isObj(footerCopyRight) && footerCopyRight.text && pageCount){
           footerCopyRight.alignment = "left";
           footerCopyRight.width = "*"
       }
       const content = pageCount ? [
           {
               columns: [
                   footerCopyRight,
                   pageCount
               ],
               columnGap: 10,
               margin 
           }
       ] : footerCopyRight? [footerCopyRight] : undefined;
       return content;
   }
};
export const pageHeaderMargin = [ 0, 0, 0, 8 ];
/**** retourne l'espace entre les colonnes des entêtes du document, espace entre la colonnes du tiers et celle de la société */
export const getHeaderColumnGap = ()=>{
    return 10;
}
/**** permet de créer l'entête de la page à générer comme pdf
 * @param : Object {
 *      ///PropType.array, le contenu à concaténer auprès du companyHeader
 *      ///tableau contenant le header à afficher côte à cote ou de manière repartie au companyHeader 
 *      pageHeader : [], le contenu à afficher du côté du companyHeader à créer
 * }
 * 
 */
export const createPageHeader = (options)=>{
    options = defaultObj(options);
    const companyHeader = getCompanyHeader(options);
    let hasCompany = companyHeader && companyHeader.length> 0;
    const dynamicPageHeaderWidth = defaultVal(options.dynamicPageHeaderWidth,0);
    let pageHeader = Array.isArray(options.pageHeader)? options.pageHeader : isObj(options.pageHeader)? [options.pageHeader] : [];
    let columnGap = getHeaderColumnGap();
    let hasLogo = hasCompany && isObj(companyHeader[0]) && companyHeader[0].image ? true : false;
    let margin = pageHeaderMargin;
    let ret = {}
    let hasColumns = false;
    if(dynamicPageHeaderWidth){
        //le logo seule prend quatre lignes
        let companyHeaderLength = hasCompany ? (hasLogo? (companyHeader.length+4):companyHeader.length) : 0;
        let diff = pageHeader.length - companyHeaderLength;
        if(diff > 1){
            let div = Math.floor(diff/2);
            for(let i = div; i >= 1;i--){
                if(i >= pageHeader.length) continue;
                companyHeader.push(pageHeader[pageHeader.length-i]);
                delete pageHeader[pageHeader.length-i];
            }
        } else if(companyHeader.length > pageHeader.length){
            let div = Math.floor((companyHeader.length-pageHeader.length)/2);
            div += hasLogo?2:0;
            for(let i = div; i >= 1;i--){
                if(i >= companyHeader.length) continue;
                pageHeader.push(companyHeader[companyHeader.length-i]);
                delete companyHeader[companyHeader.length-i];
            }
        }
        hasCompany = companyHeader.length;
        pageHeader = pageHeader.length ? pageHeader : undefined;
    }
    let pageHeaderContent = [];
    if(hasCompany){
        if(pageHeader){
            pageHeaderContent.push(companyHeader);
            pageHeaderContent.push(pageHeader);
            hasColumns = true;
        } else pageHeaderContent = companyHeader;
    } else if(pageHeader){
        pageHeaderContent = pageHeader;
    }
    if(hasColumns){
        ret.columns = pageHeaderContent;
        ret.columnGap = columnGap;
        ret.margin = margin;
    } else {
        if(isArray(pageHeaderContent)){
            ret = pageHeaderContent;
            ret.push({text:'',margin})
        } else {
            ret = {text:pageHeaderContent,margin}
        }
    } 
    return ret;
};

/****
    permet de générer l'entête de la société
    @param {
        logo {string}, Logo au format dataUrl
        displayLogo{boolean}, si le logo sera affiché
        mobile1 {string}, le téléphone mobile1,
        mobile2 {string},le téléphone mobile2
        phone {string},le téléphone mobile
        email {string}, l'email de la société
        postBox {string}, la boîte postale de la société
        fax {string}, le fax de la société
    }
*/
export const getCompanyHeader = (options)=>{
    options = defaultObj(options);
    let fontSize = defaultNumber(options.fontSize,11);
    let bold = true;
    const headerColumn = []
    if(options.displayLogo !== false && options.displayLogo !== 0 && isDataURL(options.logo)){
        headerColumn.push({
            image : options.logo,
            width : defaultNumber(options.logoWidth,LOGO_WIDTH) 
        });
    }
    const socialReason = defaultStr(options.socialReason).trim();
    if(socialReason){
        headerColumn.push({text:socialReason+"\n",fontSize:13,bold})
    }
    let phone = defaultStr(options.phone);
    if(isNonNullString(options.mobile1)){
        phone += (isNonNullString(phone)?"/":"")+options.mobile1
    }
    if(isNonNullString(options.mobile2)){
        phone += (isNonNullString(phone)?"/":"")+options.mobile2
    }
    if(isNonNullString(phone)){
        headerColumn.push({
            text : "TEL : "+phone,
            fontSize,
            bold
        });
    }
    if(isNonNullString(options.fax)){
        headerColumn.push({
            text : "FAX : "+options.fax,
            fontSize,
            bold
        })
    }
    if(isNonNullString(options.postBox)){
        headerColumn.push({
            text : "BP : "+options.postBox,
            fontSize,
            bold
        })
    }
    if(isNonNullString(options.email)){
        headerColumn.push({
            text : "EMAIL : "+options.email,
            fontSize,
            bold
        })
    }
    return headerColumn;
}

/*** récupère les marges à partir des options des pages
    les marges sont définies de la forme : 
    {
        leftMargin : {number},
        rightMargin : {number},
        topMargin : {number},
        bottomMargin: {number};
    }
*/
export const getPageMargins = (options)=>{
    options = defaultObj(options);
    const ret = [20,20,20,30];
    const margins = ['left','top','right','bottom']
    for(let i in margins){
        let m = margins[i]+"Margin";
        if(isNumber(options[m])){
            ret [i]=options[m] 
        }
        if(i == 3){
            ret[i] = Math.max(ret[i],30)
        }
    }
    return ret;
}

/***affiche le contenu rendu des ginataires du document
 * @param {Array} signatories : tableau portant la liste des signataires du document, de la forme : 
    {
        image{string|dataURL},
        label|text|code {string}, le libelé à affiché avant le signataire
    }
   @param {object} options,
 
 */
export const createSignatories = (signatories,options)=>{
    signatories = Array.isArray(signatories)? signatories : [];
    options = Object.assign({},options);
    if(!signatories.length){
        return {text:""};
    }
    const marginNumber = Math.floor(isDecimal(options.signatoriesMargin)? options.signatoriesMargin : 3);
    const opts = {
        margin  : [0,5,0,0]
    }
    const canPrintSignatoriesImages = !!options.printSignatoriesImages;
    let columns = []
    signatories.map((s,i)=>{
        if(!isObj(s)) return null;
        let image = s.image;
        const sOptions = defaultObj(s.signatureOptions);
        const style = {fontSize:14};
        s.fontStyle = defaultStr(s.fontStyle,'italics+bold').toLowerCase();
        if(s.fontStyle.contains("italics")){
            style.italics = true;
        }
        if(s.fontStyle.contains("bold")){
            style.bold = true;
        }
        s = defaultStr(s.label,s.text,s.code);
        if(isNonNullString(s)){
            let text = {text:s,...style};
            if(canPrintSignatoriesImages && isDataURL(image)){
                const signature = {image,alignment:'center',margin:[0,0,0,0]};
                const maxSignatureDim = defaultNumber(options.maxCreatedSignaturePrintSize,MAX_CREATED_SIGNATURE_PRINT_SIZE)
                let width = Math.abs(defaultNumber(sOptions.width)), 
                height = Math.abs(defaultNumber(sOptions.height));
                if(width && height){
                    width = Math.min(width,maxSignatureDim);
                    height = Math.min(height,maxSignatureDim);
                } else if(width){
                    width = height = Math.min(width,maxSignatureDim)
                } else if(height){
                    height = width = Math.min(height,maxSignatureDim);
                } else {
                    width = height = maxSignatureDim
                }
                signature.fit = [width,height];
                text = [text,signature]
            }
            columns.push(text);
        }
        return '';
    })
    if(columns.length > 0){
        let percent = (100/columns.length)
        for(let i in columns){
            columns[i].width = percent+"%";
        }
        let t = '';
        for(let i=0; i< marginNumber-1;i++){
            t+="\n";
        }
        if(t){
            columns.push({text:t})
        }
    } else {
        if(options.duplicateDocOnPage){
            let t = '';
            for(let i=0; i< marginNumber-1;i++){
                t+="\n";
            }
            if(t){
                columns.push({text:t})
            }
        }
        delete opts.margin;
        return columns;
    }
    return {
        columns,
        alignment : 'center',
        ...opts
    }
}

export const getPrintedDate = (opts)=>{
    opts = defaultObj(opts);
    let displayPrintedDate = opts.displayPrintedDate !== undefined ? opts.displayPrintedDate : true;
    if(!displayPrintedDate){
        return null;
    }
    const code = getLoggedUserCode();
    const hasCode = isNonNullString(code) || typeof code =='number';
    return [
        {
            text : [(`Date de tirage : ${new Date().toFormat(DateLib.defaultDateTimeFormat)} ${hasCode ? `, par : `:""}`).toUpperCase(),hasCode ? {text:code,bold:true}:{text:""}],
            italics: true,
            fontSize : typeof opts.printedDateFontSize =='number'? opts.printedDateFontSize : 11,
            margin : [0,3,0,0]
        } //: {}
    ]
}

/****
    
*/
export const printTags = (tags,arg)=>{
    arg = defaultObj(arg);
    const columns = []
    Object.map(tags,(s,i)=>{
        const image = outlineText(s);
        if(!image){
            columns.push({image})
        }
        return '';
    })
    if(columns.length <= 0) return null;
    return {
        columns,
        alignment : 'center',
    }
}
export {textToObject,textToObject as sprintf};