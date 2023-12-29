import {isObj,isNonNullString,isDataURL,defaultStr,sortBy,isNumber,defaultObj,defaultFunc,isFunction,defaultVal,defaultNumber} from "$cutils";
import theme from "$theme";
import {getLoggedUserCode} from "$cauth/utils";
import appConfig from "$capp/config";
import textToObject from "./textToObject";
import Colors from "$theme/colors";
import DateLib from "$clib/date";
import { LOGO_WIDTH } from "../formats/fields";
import formats from "../formats/formats"
import { defaultPageFormat,defaultPageOrientation } from "../formats";
import outlineText from "./outlineText";
import pageSizes from "../formats/pageSizes/iso";
const MAX_CREATED_SIGNATURE_PRINT_SIZE = 50;
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
    let {renderItem,filter,render,fillColor,color,upperCase,upper,...rest} = options;
    fillColor = Colors.isValid(fillColor)? fillColor : theme.colors.background;
    filter = typeof filter =="function"? filter : x=> undefined;
    color = Colors.isValid(color)? color : theme.colors.text;
    renderItem = isFunction(renderItem)? renderItem : isFunction(render)? render : undefined;
    rest = defaultObj(rest)
    let tH = [];
    Object.map(tableHeader,(e,index)=>{
        const item = e;
        if(renderItem){
            if(isObj(e)){
                e = renderItem({...e,item,index})
            } else {
                e = renderItem({value:e,item,index})
            }   
        }
        const f = filter({value:e,item,index});
        if(f === false) return null;
        if(e || f === true){
            tH.push(
                {
                    text : isNonNullString(e)? (upper!== false && upperCase !== false ? e.toUpperCase():"") : !isObj(e)? e : undefined,
                    fillColor,
                    color,
                    bold : true,
                    ...rest,
                    ...(isObj(item)? item:{}),
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
    const displaySocialReason = !!defaultVal(options.displaySocialReason,1);
    const socialReason = displaySocialReason && defaultStr(options.socialReason).trim() ||'';
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
    @see : https://pdfmake.github.io/docs/0.1/document-definition-object/page
    // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
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
        position {string}, la fonction occupée par l'employée en question
        signature {Array,Object,string}, le contenu à remplacer par la signature image, lorsque la signature n'est pas définie,
        signatureOptions {object}, les options liés à la signature : 
    }
   @param {object} options,
 
 */
export const createSignatories = (signatories,options)=>{
    signatories = Array.isArray(signatories)? signatories : [];
    options = Object.assign({},options);
    if(!signatories.length){
        return {text:""};
    }
    const marginNumber = Math.floor(typeof options.signatoriesMargin == 'number'? options.signatoriesMargin : 2);
    const opts = {
        margin  : [0,7,0,0]
    }
    const canPrintSignatoriesImages = !!options.printSignatoriesImages;
    const columns = []
    let marginText = '';
    for(let i=0; i< marginNumber-1;i++){
        marginText+="\n";
    }
    signatories.map((s,i)=>{
        if(!isObj(s)) return null;
        let image = s.image;
        const sOptions = defaultObj(s.signatureOptions);
        const style = {fontSize:13};
        s.fontStyle = defaultStr(s.fontStyle,'italics+bold').toLowerCase();
        if(s.fontStyle.contains("italics")){
            style.italics = true;
        }
        if(s.fontStyle.contains("bold")){
            style.bold = true;
        }
        const position = defaultStr(s.position);
        const signature  = Array.isArray(s.signature) || isObj(s.signature) || isNonNullString(s.signature) ? s.signature : null;
        s = defaultStr(s.label,s.text,s.code);
        if(isNonNullString(s)){
            const text = [{text:position?position:s,...style}];
            const hasImage = canPrintSignatoriesImages && isDataURL(image);
            if(hasImage){
                const signatureImage = {image,alignment:'center',margin:[0,0,0,0]};
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
                signatureImage.fit = [width,height];
                text.push(signatureImage);
            } else if(signature){
                text.push(signature);
            }
            if(position){
               //lorsque la fonction est spécifiée et que ni la signature, ni l'image n'est spécifiée, alors on laisse un intervalle de 2 lignes pour obtenir la signature concernée
                text.push({text:`${!hasImage && !signature?`${marginText}`:""}${s}`,fontSize:12});
            } else if(marginText && !hasImage && !signature){
                text.push({text:marginText})
            }
            columns.push(text);
        }
        return '';
    })

    if(columns.length > 0){
        const percent = (100/columns.length)
        for(let i in columns){
            columns[i].width = percent+"%";
        }
    } else {
        delete opts.margin;
        //return columns;
    }
    return {
        columns,
        width : '100%',
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
    return {
        text : [(`Date de tirage : ${new Date().toFormat(DateLib.defaultDateTimeFormat)} ${hasCode ? `, par : `:""}`).toUpperCase(),hasCode ? {text:code,bold:true}:{text:""}],
        italics: true,
        fontSize : typeof opts.printedDateFontSize =='number'? opts.printedDateFontSize : 11,
        margin : [0,3,0,0]
    }
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

/*** retourne les dimensions de la page */
export const getPageSize = (options,force)=>{
    options = defaultObj(options);
    let {pageHeight,pageWidth,pageSize,pageFormat,pageOrientation} = options;
    pageFormat = defaultStr(pageFormat,pageSize).trim().toUpperCase();
    if(!pageFormat || !formats.includes(pageFormat)){
        pageFormat = defaultPageFormat;
    }
    pageOrientation = defaultStr(options.pageOrientation).toLowerCase().trim();
    if(!pageOrientation || !["landscape",defaultPageOrientation].includes(pageOrientation)){
        pageOrientation = defaultPageOrientation;
    }
    const isLandScape = pageOrientation == 'landscape';
    pageSize = pageFormat;
    pageWidth = typeof pageWidth =='number'? pageWidth : 0;
    pageHeight = typeof pageHeight =='number'? pageHeight: 0;
    if(isObj(pageSizes[pageSize]) && Array.isArray(pageSizes[pageSize].pt)){
        if(pageWidth <= 0){
            pageWidth = pageSizes[pageSize].pt[isLandScape? 1 : 0]
        }
        if(pageHeight <= 0){
            pageHeight = pageSizes[pageSize].pt[isLandScape? 0 : 1]
        }
    }
    if( pageWidth > 0 && pageHeight>0){
        pageSize = {
            width : pageWidth,
            height: pageHeight           
        }
        pageOrientation = undefined;
    }
    const pageMargins = typeof options.pageMargins === 'number'? [options.pageMargins,options.pageMargins,options.pageMargins,options.pageMargins] 
        : Array.isArray(options.pageMargins) && (options.pageMargins.length == 2 || options.pageMargins.length ===4) && options.pageMargins || getPageMargins(options);
    //console.log(pageSize,pageFormat,' page format is page siez')
    let margins = {};
    if(pageMargins.length === 2){ //[horizontal, vertical]
        margins = {
            pageMarginLeft : pageMargins[0],
            pageMarginRight : pageMargins[0],
            pageMarginTop : pageMargins[1],
            pageMarginBottom : pageMargins[1],
        }
    } else {
        margins = {
            pageMarginLeft : pageMargins[0],
            pageMarginTop : pageMargins[1],
            pageMarginRight : pageMargins[2],
            pageMarginBottom : pageMargins[3],
        }
    } 
    return {pageSize,pageFormat,pageOrientation,pageMargins,...margins}
}
export {textToObject,textToObject as sprintf};

export {outlineText};