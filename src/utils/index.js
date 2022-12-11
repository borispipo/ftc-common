// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import _uniqid from "./uniqid";
import _isDomElement from "./dom/isDOMElement";
import { isPlainObject as _isPlainObject} from "./extendObj";
import defStr from "./defaultStr"
import isNStr from "./isNonNullString";
import { parseJSON as pJSON, isJSON as isJ } from "./json";
import isDateObj from "./isDateObj";
import sprintf  from "./sprintf";
import base64 from "$base64";

const sanitize = require("sanitize-filename");

export {sprintf};
export {default as LorenIpsum} from "./loremIpsum";
export {default as loremIpsum } from "./loremIpsum";
export {default as StringBuilder} from "./StringBuilder";

export const uniqid = _uniqid;
export const parseJSON = pJSON;
export const isJSON = isJ;
export const isDOMElement = _isDomElement;
export {default as extendObj } from "./extendObj"
export const defaultStr = defStr;
export const isNonNullString = isNStr;



export const isWindowClient = x=> typeof window !== "undefined" && typeof (window) =="object" ? true : false;

if(typeof __DEV__ == 'undefined'){
    if(isWindowClient()){
        window.__DEV__ = true;
    } else if(typeof global !=='undefined' && global){
        global.__DEV__ = true;
    }
}

export * from "./uri";

export const arrayValueExists = function(array,value,ignoreCase,compare) {
    if(isFunction(ignoreCase)){
        compare = ignoreCase;
    }
    compare = defaultFunc(compare,(a,b)=>a == b);
    ignoreCase = defaultBool(ignoreCase,false);
    if(typeof array != 'object' && typeof value == 'object'){
        var _t = value;
        value = array
        array = _t;
    }
    if(typeof array != "object" | array === null) return false;
    for (var key in array) {
        if(compare(array[key],value)) return true
        if(ignoreCase && isNonNullString(value) && isNonNullString(array[key])){
            if(array[key].toLowerCase().trim() === value.toLowerCase().trim ()){
                return true;
            }
        }
    }
    return false;
}
/**helper functions
 *  détermine si la valeur d'un élement existe dans un tableau
 *  @param array / value, le tableau où l'élément à vérifier
 *  @param value / array : la valeur ou le tableau de l'élément à vérifier
 *  @param ignoreCase  : bool default false, si la casse sera ignorée où pas
 *  @param compare : function de comparaison des éléments du tableau
 * 
 */
export const arrayKeyExists = function(array, key_to_check) {
    if(typeof array != 'object' && typeof key_to_check=='object'){
        var t = array;
        array = key_to_check;
        key_to_check = t;
    }
    if(typeof array != "object" | array == null) return false;
    for (var key in array) {
        if(key_to_check == key) return true
    }
    return false;
}
export const isPlainObject = _isPlainObject;

export const isPlainObj = isPlainObject;

/*** simillaire à Array.map mais sauf que, prend un objet ou un tableau en paramètre 
    retourne comme résultat, un tableau
*/
export const ObjectMapToArray = Object.mapToArray = function(obj,fn){
    if(Array.isArray(obj)){
        return obj.map(fn);
    }
    return Object.toArray(Object.map(obj,fn));
};
export const mapObj = Object.map = function(obj,fn){
    if(typeof fn != 'function') {
        return {};
    }
    if(Array.isArray(obj)) return obj.map((item,index)=>{
        return fn(item,index,index);
    });
    if(!(obj) || typeof obj !=='object') {
        return {};
    }
    var oReturn = {};
    let mapI=0;
    for (let sCurObjectPropertyName in obj) {
        if(obj.hasOwnProperty(sCurObjectPropertyName)) {
            oReturn[sCurObjectPropertyName] = fn.call(obj,obj[sCurObjectPropertyName], sCurObjectPropertyName,mapI,true);
            mapI++;
        }
    }
    return oReturn;
}
export const mapObject = mapObj;
/**** 
*  détermine la taille d'un tableau/object
*  @param : l'objet à déterminer la taille
   @param : breakonFirstElementFound {boolean}, retourne immédiatement après le premier élément trouvé
*/
export const objectSize = Object.size  = function(obj,breakonFirstElementFound) {
    if(!obj || typeof obj != "object") return 0;
    if(Array.isArray(obj)){
        return obj.length;
    }
    if(typeof breakonFirstElementFound !=='boolean'){
        breakonFirstElementFound = false;
    }
    let size = 0;
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            size++;
            if(breakonFirstElementFound === true) return size;
        }
    }
    return size;
}

/******
*  converti un objet en tableau
*  @param : l'objet à covertir
*  @param : la functon de rappel prenant en paramètre l'ensemble des clés de l'objet suivant leur ordre dans le tableau
   @param : string le nom du champ à utiliser pour garder les clés des différentes instances d'objet
*/
export const ObjectToArray = Object.toArray = function(obj,cb,keyName){
    if(Array.isArray(obj)) return obj;
    if(!isPlainObject(obj)) {
        if(isNullOrEmpty(obj,true)) return [];
        return [obj];
    }
    var r = [];
    var keys = [];
    Object.keys(obj).map(function(k){
        //la clé est définie comme clée des différents instances de l'objet
        if(isNonNullString(keyName) && isObj(obj[k])){
            obj[k][keyName] = k;
        }
        keys.push(k);
        r.push(obj[k])
    });
    if(isFunction(cb)){
        cb(keys);
    }
    return r;
}

export function defaultVal (){
    var args = Array.prototype.slice.call(arguments,0);
    let nullV = undefined;
    for(let i in args){
        if(args[i] !== undefined && args[i] !== '') {
            if(args[i] === null){
                nullV = null;
            } else {
                return args[i]
            }
        }
    }
    return nullV;
}

export function defaultBool(){
    var args = Array.prototype.slice.call(arguments,0);
    for(var i in args){
        if(typeof args[i] === 'boolean') return args[i]
    }
    return false;
}

export function defaultDecimal (){
    var args = Array.prototype.slice.call(arguments,0);
    for(var i in args){
        if(isDecimal(args[i]) && args[i] !== 0) return args[i]
    }
    return 0;
}

export const defaultNumber = function(){
    var args = Array.prototype.slice.call(arguments,0);
    for(var i in args){
        if(isNumber(args[i]) && args[i] !== 0) return args[i]
    }
    return 0;
}

export const isUndefined = (str) =>{return typeof str === 'undefined'};

export const defaultFunc = function(){
    var args = Array.prototype.slice.call(arguments,0);
    for(var i in args){
        if(typeof args[i] === "function") return args[i]
    }
    return ()=>{};
}
/*** fix bug, defaultObj, où l'on perd la référence lorsque l'orsqu'une seule variable passée en paramètre est de type object */
export const defaultObj = function() {
    var args = Array.prototype.slice.call(arguments,0);
    if(args.length === 1) return isObj(args[0]) ? args[0] : {};
    for(var i in args){
        const x = args[i];
        if(isObj(x) && Object.size(x,true)>0) return x;
    }
    return {};
}
export const isObjOrArray = x =>  x && typeof x =="object" ? true : false;
export const defaultObjOrArray = function(){
    var args = Array.prototype.slice.call(arguments,0);
    for(var i in args){
        let x = args[i];
        if(isObjOrArray(x)) return x;
    }
    return null;
}

export const isObjectOrArray= a => isObj(a) || isArray(a);

export const defaultArray = function(){
    var args = Array.prototype.slice.call(arguments,0);
    if(args.length === 1 && isArray(args[0])) return args[0];
    for(var i in args){
        let x = args[i];
        if(x && Array.isArray(x) && x.length > 0) return x;
    }
    return [];
}

export {default as isPromise} from "./isPromise";


export const isPureFunction = (functionName) =>{
    return typeof functionName === 'function';
}

export const isString = function(str){
    return typeof str === "string";
}

export const isBool = function(v){
    return typeof v === 'boolean';
}

export const isArray = function(array){
    if(typeof Array.isArray === 'function'){
        return Array.isArray(array);
    }
    return Object.prototype.toString.call(array) === '[object Array]';
}


export const isNumber = function(n) {
    if(typeof n === 'number' && !isNaN(n)) return true;
    return n === +n && n === (n|0);
}

export function isInteger(x) { return typeof x === "number" && isFinite(x) && Math.floor(x) === x; }

export const isFloat =  function(n) {
    if(isNumber(n)) return true;
    if(isNaN(n)) return false;
    return  n === +n && n !== (n|0);
}

export const isDecimal = isFloat;

export function isObj (obj){
    if(!obj) return false;
    return obj && Object.prototype.toString.call(obj) === '[object Object]' && !(obj instanceof RegExp)? true : false;
}

export const isNullOrEmpty = function (object,checkDomElement,escapeBoolean){
    if(isDateObj(object)) return false;
    if(typeof object == 'number') return false;
    if(typeof object === 'boolean'){
        if(checkDomElement === true || escapeBoolean === true){
            return false;
        }
        return (object == false);
    }
    if(typeof object == 'undefined' || object === null || object === undefined || object === '') return true;
    if(typeof object == 'string'){
        return (object == null | object == '');
    }
    if(typeof object == 'object'){
        var $return = (Object.size(object,true) > 0)? false : true; 
        if(Array.isArray(object)) return $return;
        if(checkDomElement) {
            $return = ($return == false) ?  false : isDOMElement(object)? false : true;
        }
        return $return; 
    }
    return false;
}



export const isValidDataFileName = function(value,escapeDot){
    if(!isNonNullString(value)) return false;
    if(escapeDot === true) value = value.replaceAll(".","");
    return /^[A-Za-z0-9_-]+$/.test(value);
}

export const isConstructor = function isConstructor(obj){
    if(isNullOrEmpty(obj)) return false;
    return !!obj.prototype && !!obj.prototype.constructor.name;
}

export const isWindow  = function(obj) {
    var toString = Object.prototype.toString.call(obj);
    return toString == '[object global]' || toString == '[object Window]' || toString == '[object DOMWindow]';
};


/***** 
 * @param {string} le nombre à parser
 * @param {boolean} si l'on doit préserver le nombre de décimales
 */
export const parseDecimal =  (x,preserveDecimalLength) =>{
    if(isDecimal(x)) return x;
    if(isNonNullString(x)) {
        if(!x.contains(".")){
            x = x.replace(",",".");
        }
        return parseFloat(x.replaceAll(" ",''));
    } 
    return 0;
}

export const getObjectClass = function (obj){
    if (obj && obj.constructor && obj.constructor.toString()) {
        return obj.constructor;
    }
    return null;
}

export const isIE = function() {
    if(typeof window =="undefined" || !window) return false;
    if(!window.navigator || !isNonNullString(window.navigator.userAgent)) return false;
    var msie = ua.indexOf('msie ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }
    var trident = ua.indexOf('trident/');
    if (trident > 0) {
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }
    var edge = ua.indexOf('edge/');
    if (edge > 0) {
        // Edge (IE 12+) => return version number
        return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }
    // other browser
    return false;
}

export const randomInt = function(min,max) {
    if(isObj(min)){
        max = isNumber(min.max) ? min.max  : 100;
        min = isNumber(min.min)? min.max : 0; 
    }
    if(!isNumber(min)){
        min = 0;
    }
    if(!isNumber(max)){
        max = 100;
    }
    return Math.floor(Math.random() * max) + min;
}


export const randomNumber = randomInt;

export const isMobileOrTablet = function(){
    var check = false;
    if(typeof navigator == undefined || navigator == null) return false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
}

export {default as isTouchDevice} from "./isTouchDevice"

export {isClientSide,isServerSide} from "$cplatform"

export * from "./extend.prototypes";

require("./dom")

require("./polyfill");


export const sanitizeSheetName = function(sheetName){
    if(!isNonNullString(sheetName)) return "";
    sheetName = sheetName.replaceAll("/","-").replaceAll("\\","-").sanitizeFileName().replaceAll("[","<").replaceAll("]","")
    //let badchars = "][*?\/\\".split("");
    if(sheetName.length > 31){
        sheetName = sheetName.substring(0,28)+"..."
    }
    return sheetName;
}

export const sanitizeFileName  = (str,escapeSpaces)=>{
    escapeSpaces = isBool(escapeSpaces)? escapeSpaces : true;
    if(isNonNullString(str)){
        if(escapeSpaces) str = str.removeSpecialChars().replaceAll(" ","-").replaceAll("[","(").replaceAll("]",")")
        return sanitize(sprintf(str).replaceAll("/","-"));
    }
    return "";
}

String.prototype.sanitizeFileName = function(escapeSpaces){
    return sanitizeFileName(this.toString(),escapeSpaces);
}
String.prototype.sanitizeSheetName = function(){
    return sanitizeSheetName(this.toString(),false);
}

/*****
 *  ucfirstUnderground : change the string  from camel case into  snake case 
 * (addElementComponent => ADD_ELEMENT_COMPONENT)
 *  exemple : 
 *      toSnakeCase('thisISDifficult') -> THIS_IS_DIFFICULT
    toSnakeCase('thisISNT') -> THIS_ISNT
*/
export const toSnakeCase = (text)=> {
    if(!isNonNullString(text)) return '';
    text = text.trim();
    return text.replace(/(.)([A-Z][a-z]+)/, '$1_$2').replace(/([a-z0-9])([A-Z])/, '$1_$2').toUpperCase()
}

export const toSnake= toSnakeCase;

String.prototype.toSnakeCase = String.prototype.snakeCase = String.prototype.toSnake = function(){
    return toSnakeCase(this.toString());
}
/*****
 *  undergroundUcFirst : change the string  from snake case into camel case (
 *  ADD_ELEMENT_COMPONENT => addElementComonent)
 *  exemple : 
*      camelCase('THIS_IS_DIFFICULT') -> 'ThisISDifficult
    camelCase('THIS_ISNT') -> 'THISISNT'
*/
export const toCamelCase = (text) => {
    if(!isNonNullString(text)) return '';
    text = text.trim();
    return text.charAt(0)+ ((text.indexOf("_")!=-1)?text.toLowerCase():text).replace(/(_\w)/g, k => k[1].toUpperCase()).substring(1)
}

export const toCamel = toCamelCase;

String.prototype.toCamelCase = String.prototype.toCamel = String.prototype.camelCase = function(){
    return toCamelCase(this.toString());
}

export const ucFirst = function(str) {
    if(!str || typeof str !=="string") return "";
    str = str.trim();
    return str.charAt(0).toUpperCase() + str.slice(1);
};
export const upperFirst = ucFirst;

if(typeof String.prototype.ucFirst !='function'){
    String.prototype.ucFirst = function(){
        return ucFirst(this.toString());
    }
}
export const lowerFirst = function(str) {
    if(!str || typeof str !=="string") return "";
    str = str.trim();
    return str.charAt(0).toLowerCase() + str.slice(1);
};
String.prototype.toUpperFirst = upperFirst;
String.prototype.lowerFirst = String.prototype.toLowerFirst  = function(){
    return lowerFirst(this.toString());
};
const _isClassExtends = (ChildClass, ParentClass)=> {
    if(!ChildClass || !ChildClass.prototype) return false;
    let _p = ChildClass.prototype;
    while (_p != null) {
      if (_p == ParentClass.prototype)
        return true;
      _p = _p.__proto__;
    }
    return false;
}
/**** vérifie si la sous classe passé en premier paramètre hérite de la seconde clase 
    @param, la classe enfant,
    @param, la classe parent
*/
export const isClassExtends = (ChildClass,ParentClass)=>{
    if(!isObj(ChildClass)) return false;
    return _isClassExtends(ChildClass,ParentClass) || 
        (ChildClass.constructor && _isClassExtends(ChildClass.constructor,ParentClass))
}


export {default as debounce} from "./debounce";

const isDataURLRegex = /^data:([a-z]+\/[a-z0-9-+.]+(;[a-z0-9-.!#$%*+.{}|~`]+=[a-z0-9-.!#$%*+.{}|~`]+)*)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s]*?)$/i;

export const  isDataURL = function isDataURL(s) {
    return isNonNullString(s) && !s.contains("data:image/x-icon") && !!s.match(isDataURLRegex);
}

export const isValidImageSrc = src => {
    if(!isNonNullString(src)) return false;
    src = src.trim();
    if(src.startsWith("blob:http")){
        src = src.ltrim("blob:");
    }
    return isDataURL(src) || isValidUrl(src) || src.startsWith("data:image/");
}
export const isBlob = (blob) =>{
    if(!blob) return false;
    try {
        if(blob instanceof Blob) return true;
    } catch{}
    return false;
}
export const isBase64 = function isBase64(str, options) {
    options = defaultObj(options);
    options.urlSafe = defaultBool(options.urlSafe,false);
    const len = str.length;
    if (options.urlSafe) {
        return /^[A-Z0-9_\-]*$/i.test(str);
    }
    if (len % 4 !== 0 || /[^A-Z0-9+\/=]/i.test(str)) {
        return false;
    }
    const firstPaddingChar = str.indexOf('=');
    return firstPaddingChar === -1 || firstPaddingChar === len - 1 ||
        (firstPaddingChar === len - 2 && str[len - 1] === '=');
  }

  /**** parser for data url */
 let dataURLDecoder = (dataURLStr)=>{
    if(!isDataURL(dataURLStr)) return undefined;
    let dataURLPattern = /^data:((.*?)(;charset=.*?)?)(;base64)?,/;

    // parse the dataURL components as per RFC 2397
    let matches = dataURLStr.match(dataURLPattern);
    if (!matches) {
        return undefined;
    }

    // default to text/plain;charset=utf-8
    var mediaType = matches[2]
        ? matches[1]
        : 'text/plain' + (matches[3] || ';charset=utf-8');

    return {
        matches,
        isBase64 : !!matches[4],
        data : dataURLStr.slice(matches[0].length),
        mediaType
    }
 }

 export const parseDataURL = (s) => {
    if (!isDataURL(s)) {
      return undefined;
    }
  
    const parts = s.trim().match(isDataURLRegex);
    const parsed = {};
  
    if (parts[1]) {
      parsed.mediaType = parts[1].toLowerCase();
  
      const mediaTypeParts = parts[1].split(';').map(x => x.toLowerCase());
  
      parsed.contentType = mediaTypeParts[0];
  
      mediaTypeParts.slice(1).forEach((attribute) => {
        const p = attribute.split('=');
        parsed[p[0]] = p[1];
      });
    }
  
    parsed.isBase64 = !!parts[parts.length - 2];
    parsed.data = parts[parts.length - 1] || '';
  
    parsed.toBuffer = () => {
      const encoding = parsed.isBase64 ? 'base64' : 'utf8';
  
      return Buffer.from? Buffer.from(parsed.data, encoding) : new Buffer(parsed.data, encoding);
    };
    //{mediaType,contentType}
    return parsed;
 }

 /**** convertis une chaine de caractère data-url en objet blob */
 export function dataURLToBlob(dataURLStr){
    let cvr = dataURLDecoder(dataURLStr);
    if(!isObj(cvr) || !isNonNullString(cvr.data)) return undefined;
    let {isBase64,data} = cvr;
    var byteString = isBase64
        // convert base64 to raw binary data held in a string
        ? atob(data)
        // convert base64/URLEncoded data component to raw binary
        : decodeURIComponent(data);

    var array = [];
    for (var i = 0; i < byteString.length; i++) {
        array.push(byteString.charCodeAt(i));
    }

    return new Blob([new Uint8Array(array)], { type: mediaType });
 }

 /*** converti un contenu base 64 en blob
  * @see : https://stackoverflow.com/questions/34993292/how-to-save-xlsx-data-to-file-as-a-blob/35713609#35713609
  * @param {string} base64Data la chaine a convertir 
  * @return {null || Blob} null si le contenu base64Data est invalide
  */
 export function base64toBlob(base64Data, contentType) {
    if(!isBase64(base64Data)) return null;
    contentType = defaultStr(contentType);
    let sliceSize = 1024;
    let byteCharacters = atob(base64Data);
    let bytesLength = byteCharacters.length;
    let slicesCount = Math.ceil(bytesLength / sliceSize);
    let byteArrays = new Array(slicesCount);
    for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        let begin = sliceIndex * sliceSize;
        let end = Math.min(begin + sliceSize, bytesLength);

        let bytes = new Array(end - begin);
        for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
            bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
}
export const base64ToBlob = base64toBlob;
 /**** convertis une chaine de caractère data-url en objet blob */
 export function dataURLToBase64(dataURLStr){
    if(!isDataURL(dataURLStr)) return undefined;
    return dataURLStr.replace(/^data:.+;base64,/, '')
 }

 /*** vérifie si la valeur passée en paramètre est un email valide
 * @param {string} email à vérifier
 * @param {bool}, si le validateur doit retourner false lorsque l'émail n'est pas une chaine de caractère
 */
 export const isValidEmail = (value,required)=>{
    if(!isNonNullString(value)){
        return required ? false : true;
    }
    let re = /^(")?(?:[^\."])(?:(?:[\.])?(?:[\w\-!#$%&'*+\/=?\^_`{|}~]))*\1@(\w[\-\w]*\.){1,5}([A-Za-z]){2,6}$/
    return value.match(re) ? true : false;
}

/***@function
 * @alias isValidEmail
 * alias à la fonction isValidEmail
 */
export const isValidMail = isValidEmail;

/**
 * Mask email address with asterisks to comply GDPR
 * john.doe@example.com => j******e@e****e.com
 * @param {string} emailAddress email address
 * @returns {string} masked email address
 */
export const hideEmailAddress = function maskEmailAddress (emailAddress) {
    if(!isNonNullString(emailAddress)) return "";
    function mask(str) {
        if(!isNonNullString(str)) return "";
        var strLen = str.length;
        if (strLen > 4) {
            return str.substr(0, 1) + str.substr(1, strLen - 1).replace(/\w/g, '*') + str.substr(-1,1);
        } 
        return str.replace(/\w/g, '*');
    }
    return emailAddress.replace(/([\w.]+)@([\w.]+)(\.[\w.]+)/g, function (m, p1, p2, p3) {      
        return mask(p1) + '@' + mask(p2) + p3;
    });
}
/*** mask some number in a phone number */
export const maskPhoneNumber = function(number){
    number = defaultStr(number).replaceAll(" ","");
    if(!number || number.length < 5) return "";
    if(number < 8){
        return number.substring(0,2) + number.substr(2,number.length).replace(/.(?=.{2})/g, "*");
    }
    return number.substring(0,4) + number.substr(4,number.length).replace(/.(?=.{2})/g, "*");
}


/**** détermine si les tableaux passés en paramètre sont égaux ou pas */
export const areArraysEquals = function (a1,a2,compare) {
    if(!Array.isArray(a1) || !isArray(a2) || a1.length != a2.length) return false;
    compare = typeof compare =='function'? compare : (a,b)=> a === b;
    for (var i = 0, l=a1.length; i < l; i++) {
        // Check if we have nested arrays
        if (Array.isArray(a1[i]) && Array.isArray(a2[i])) {
            // recurse into the nested arrays
            if (!areArraysEquals(a1[i],a2[i],compare)) return false;       
        }           
        else if (!compare(a1[i],a2[i])) { 
            return false;   
        }           
    }       
    return true;
}

export function objectAreEquals( x, y ) {
    if ( x === y ) return true;
      // if both x and y are null or undefined and exactly the same
  
    if ( ! ( x instanceof Object ) || ! ( y instanceof Object ) ) return false;
      // if they are not strictly equal, they both need to be Objects
  
    if ( x.constructor !== y.constructor ) return false;
      // they must have the exact same prototype chain, the closest we can do is
      // test there constructor.
  
    for ( var p in x ) {
      if ( ! x.hasOwnProperty( p ) ) continue;
        // other properties were tested using x.constructor === y.constructor
  
      if ( ! y.hasOwnProperty( p ) ) return false;
        // allows to compare x[ p ] and y[ p ] when set to undefined
  
      if ( x[ p ] === y[ p ] ) continue;
        // if they have the same strict value or identity then they are equal
  
      if ( typeof( x[ p ] ) !== "object" ) return false;
        // Numbers, Strings, Functions, Booleans must be strictly equal
  
      if ( ! objectAreEquals( x[ p ],  y[ p ] ) ) return false;
        // Objects and Arrays must be tested recursively
    }
  
    for ( p in y )
      if ( y.hasOwnProperty( p ) && ! x.hasOwnProperty( p ) )
        return false;
          // allows x[ p ] to be set to undefined
  
    return true;
}
if(!isFunction(Object.areEquals)){
    Object.defineProperties(Object,{
        areEquals : {value : objectAreEquals,override:false}
    })
} 
export const typeOf = function (obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}
export const removeSpecialChars = function(s){
    if(!isNonNullString(s)) return "";
    let r = s.toLowerCase();
    let non_asciis = {'a': '[àáâãäå]', 'ae': 'æ', 'c': 'ç', 'e': '[èéêë]', 'i': '[ìíîï]', 'n': 'ñ', 'o': '[òóôõö]', 'oe': 'œ', 'u': '[ùúûűü]', 'y': '[ýÿ]'};
    for (let i in non_asciis) { r = r.replace(new RegExp(non_asciis[i], 'g'), i); }
    return r;
}
if(typeof String.prototype.removeSpecialChars !=="function"){
    String.prototype.removeSpecialChars = function(){
        return removeSpecialChars(this.toString());
    }
}

// Escapes the special characters in @text so that it can serve as a literal pattern in a regular expression
export const escapeSpecialChars = (function () {
    var _pattern = /([.*+?=!:${}()|\-\^\[\]\/\\])/g;
    return function (text) {
        if (typeof text !== "string") return null;
        return text.replace(_pattern, "\\$1");
    }
}())


/**** auto bind, les méthodes sur l'objet context passé en paramètre 
    @praam methodsName : la ou les function qui seront binding par le context
    @param, obj : le context sur lequel appliquer les fonctions
    @param fucntion : la fonction de rappel prenant en paramètre le nom de la méthode courante, appelée à chaque boucle sur les différentes fonction de l'objet context
    Exemple : f = autobind(f,context);
            : autobind.call(this,['m1','m2','m3']);
            : autobind.call(this,null,indivualMethodCallback) //bind automatiquement toutes les méthodes de 'lobjet
            : autobind.call(this,individualMethodCallback)
*/
export const autobind = function autobind(methodsName,context,individualMethodCallback){
    if(isFunction(methodsName)){
        individualMethodCallback = methodsName;
        methodsName = undefined;
        context = context || this;
    }
    if(!context) context = this;
    if(!context) return;
    if(isObj(context) || isConstructor(context)) {
        let r = [];
        if(!methodsName) methodsName= '';
        else r = Object.toArray(methodsName);
        Object.getAllMethodNames(context,function(m){
            if(r.length > 0 && !arrayValueExists(m,r)) return;
            if(typeof(context[m]) != 'function') return;
            try {
                context[m] = context[m].bind(context);
            } catch(e){
                context[m].bind(context);
            }
            if(typeof individualMethodCallback == 'function'){
                individualMethodCallback.call(context,m);
            }
        });
    } 
    if(isObjOrArray(methodsName)){
        for(let k in methodsName){
            if(typeof(methodsName[k]) == 'function'){
                methodsName[k] = methodsName[k].bind(context);
            }
        }
    } else if(typeof(methodsName) == 'function'){
        methodsName = methodsName.bind(context);
    }
    return methodsName;
}

/***
 * Retourne la liste des méthodes de l'objet passé en paramètre dans un tableau
 * @param object obj : l'objet auquel l'on désire retourner les méthodes de l'objet
 * @param function individualMethodCallback : la function à appeler sur chaque méthode trouvée lorsque la boucle parcourant les différentes méthodes est effectuée
 */
export const getAllMethodNames = Object.getAllMethodNames = function (obj,individualMethodCallback,level) {
    let props = []
    if(!obj) return []
    let _obj = obj;
    level = isNumber(level)?level:1;
    let index = 0;
    do {
        let l = Object.getOwnPropertyNames(obj)
            .concat(Object.getOwnPropertySymbols(obj).map(s => s.toString()))
            .sort()
            .filter((p, i, arr) =>
                typeof obj[p] === 'function' &&  //only the methods
                p !== 'constructor' &&           //not the constructor
                (i == 0 || p !== arr[i - 1]) &&  //not overriding in this prototype
                props.indexOf(p) === -1          //not overridden in a child
            )
        props = props.concat(l)
        index++;
    }
    while (
        (obj = Object.getPrototypeOf(obj)) &&   //walk-up the prototype chain
        Object.getPrototypeOf(obj)              //not the the Object prototype methods (hasOwnProperty, etc...)
        && index <= level //on parcours toutes les propriétés jusqu'à une certaine hiérarchie
    )
    if(typeof individualMethodCallback === 'function'){
        individualMethodCallback.bind(_obj);
        props.map(l =>{
            individualMethodCallback.call(_obj,l);
        });
    }
    return props
}

const getItem = (x,prop) => isObj(x) && prop in x ? x[prop] : x;

function mergeSort(array,compare) {
    if(!Array.isArray(array)) return [];
  var length =  array.length,
      middle = Math.floor(length / 2);

  if (!compare) {
    compare = function(left, right) {
      if (left < right)
        return -1;
      if (left == right)
        return 0;
      else
        return 1;
    };
  }
  if (length < 2)
    return array;

  return merge(
    mergeSort(array.slice(0, middle),compare),
    mergeSort(array.slice(middle, length),compare),
    compare
  );
}

function merge(left, right, compare) {
  var result = [];
  while (left.length > 0 || right.length > 0) {
    if (left.length > 0 && right.length > 0) {
      if (compare(left[0], right[0]) <= 0) {
        result.push(left[0]);
        left = left.slice(1);
      }
      else {
        result.push(right[0]);
        right = right.slice(1);
      }
    }
    else if (left.length > 0) {
      result.push(left[0]);
      left = left.slice(1);
    }
    else if (right.length > 0) {
      result.push(right[0]);
      right = right.slice(1);
    }
  }
  return result;
}

/**
     *  Trie un objeet ou un tableau d'elements.
     *  exemple : sortBy([{test:'b'},{test:'b}],{parser:(a,column)=>a[column],dir:'asc',ignoreCase:fale})
     *  Exemple de cfg : {dir:'asc',getItem:(item,column)=>{},}
     * @param  {Array || object} la collection à trier
     * @param  {Object} cfg: les options de configuration : 
*          cfg = {
            deleteKey : ///si la clé sera supprimée
            keyName : le nom de la clé unique à chaque item
            returnObject : true // un object sera retourné
            returnArray : true //si le resultat retourné sera un tableau où non
*               desc : true || dir : 'asc' || dir : 'desc' //la direction du trie
*               column || columnName : 'test' //le nom de la colonne à utiliser pour le trie si c'est un tableu
*               igonoreCase : true //si la casse sera ignorée lors du trie
*          }
     */
export const sortBy = function sortby(array, cfg,itemMutator) {
    if (!isObj(cfg)) cfg = {};
    if(!isObjOrArray(array)) {
        return (cfg.returnArray === false || cfg.returnObject !== false) ? {} : []
    }
    let result = {};
    if(isNonNullString(cfg.dir)){
        cfg.dir = cfg.dir.toLowerCase().trim();
        cfg.desc = cfg.dir === 'desc';
    }
    if(!typeof cfg.desc == 'boolean'){
        cfg.desc = false;
    }
    cfg.desc = !!cfg.desc ? -1 : 1;
    let keys = []
    let keyName = defaultStr(cfg.keyName,uniqid("sort-by-object-keyname"));
    let columnName = defaultStr(cfg.column,cfg.columnName);
    cfg.getItem = defaultFunc(cfg.getItem,getItem);
    //itemMutator = defaultFunc(itemMutator,cfg.mutator,cfg.itemMutator);
    const compare = function(a, b){
        a = cfg.getItem(a,columnName,{a,b,getItem});
        if(a === undefined) a = "";
        b = cfg.getItem(b,columnName,{a,b,getItem});
        if(b ===undefined) b = "";
        switch(typeof(a)) {
            case 'string' : 
                if(cfg.ignoreCase !==false){
                    a = typeof a =='string' ? a.toLowerCase():'';
                    b = typeof b ==='string' ? b.toLowerCase() : '';
                }
            break;
                case 'boolean' : 
                a = a+'';
                b = b+'';
                break;
            default : 
                break;
        }
        return cfg.desc * (a < b ? -1 : +(a > b));
    };
    let r = Object.toArray(array,(_keys)=>{keys = _keys;},keyName);
    r = mergeSort(r,compare);
    if(isObj(array) && (cfg.returnArray === false || cfg.returnObject !== false)){
        for(let i in r){
            result[defaultStr(r[i][keyName],keys[i])] = r[i];
            if((keyName != cfg.keyName) || cfg.deleteKey) delete r[i][keyName];
        }
        return result;
    }
    return r;
};


/*** suites des constantes et fonctions utiles */
/**
    retourne l'extension du fichier passé en paramètre
    @param string le chemin du fichier
    @param bool withoutDash, précise si l'extension sera retourné avec le point ou pas
*/
export const getFileExtension = function(path,withoutDash){
    if(!path || typeof path != 'string') return '';
    if(path.indexOf(".") ===-1) return '';
    var er = path.split(".");
    var e = er[er.length-1];
    //var e = path.slice(1).split('.').pop();
    withoutDash = (withoutDash == undefined) ? true : withoutDash;
    e = e.trim().ltrim(".");
    if(e.startsWith("/")){
        return '';
    }
    if(!withoutDash){
        e = "."+e;
    } 
    return e;
}
/**** retourne le chemin du répertoire parent à un path */
export const getFileDirectory = (filePath) => {
    if(!isNonNullString(filePath)) return "";
    if (filePath.indexOf("/") == -1) { // windows
      return filePath.substring(0, filePath.lastIndexOf('\\'));
    } 
    else { // unix
      return filePath.substring(0, filePath.lastIndexOf('/'));
    }
  }

/*** retourne le nom du fichier à partir de son chemin complet 
 * @param filePath : le chemin du fichier
 * @param withoutExtension : bool pour indiquer si le nom sera retourneé sans extension
 * par défaut : faux
*/
export const getFileName = (filePath,withoutExtension)=>{
    if(!isNonNullString(filePath)) return "";
    const isNotPath = !filePath.contains("/") && !filePath.contains("\\");
    if(!isNotPath){
        filePath.rtrim("/").rtrim("\\").ltrim("/").ltrim("\\").trim();
        if(!filePath) return filePath;
        filePath = filePath.replace(/^.*(\\|\/|\:)/, '');
    }
    if(withoutExtension){
        //return filePath.replace(/(\.[^.]*)$/, '');
        let er = filePath.split(".");
        let e = er[er.length-1];
        return filePath.rtrim("."+e).rtrim(".");
    }
    return filePath;
}

export function isFunction(function_name,checkFunctionString){
    if(typeof function_name == 'undefined' |  function_name =='' | function_name == null) return false;
    if(typeof function_name == 'function'){
        return true;
    } 
    return false;
}

/****
 * exécute la fonction dont la chaine de caractèr est passée en paramètre comme nom
 */
export const executeFunctionByName = function(functionName, context /*, args */) {
    var args = [].slice.call(arguments).splice(2);
    var namespaces = functionName.split(".");
    var func = namespaces.pop();
    for(var i = 0; i < namespaces.length; i++) {
        context = context[namespaces[i]];
    }
    return context[func].apply(context, args);
}

/****
 * retourne la valeur de la propriété passée à un objet au cas où elle existe
 * @param object, l'objet en question
 * @param string property_name, le nom de la propreté qu'on souhaite récupérer sur l'objet object
 * @param default value, la valeur par défaut à retourner au cas où l'objet object n'admet pas de prorieté prop
 */
export const getPropValue = Object.getPropValue = function getPropValue(object, property_name,default_value){
    if(typeof property_name == 'object' & typeof object != 'object'){
        var t = property_name;
        property_name = object;
        object = t;
    }
    if(typeof object != 'object'){
        if(typeof default_value != "undefined") return default_value
        return '';
    }
    if(typeof property_name == 'object') return default_value; 
    if(object && typeof object[property_name] != "undefined"){
        if(object[property_name] != null & object[property_name] != 'null') return object[property_name]
    }
    if(typeof default_value != "undefined") return default_value;
    return '';
}

/*** compare deux variable : 
 *  @param a : mixted : object, array, int, ....
 *  @param b : mixted : object, array, int, ....
 *  @param boolean : autoriser la prise en compte des valeurs non définies ou nulles
 *  si les objets sont de type différents alors la fonction retourne false
 */
export const compare = function compare (a,b,avoidUndefinedValue) {
    var obj_str = '[object Object]',
    arr_str = '[object Array]',
    a_type  = Object.prototype.toString.apply(a),
    b_type  = Object.prototype.toString.apply(b);
    if(avoidUndefinedValue === true){
        if(typeof a ==='undefined' || typeof b ==='undefined') return false;
        if(a === null || b === null || (a_type =='string' && a ==='') || (b_type =='string' && b ==='')) return false;
    }
    if ( a_type !== b_type) { return false; }
    if (a_type === obj_str) {
        return compareObject(a,b);
    }
    if (a_type === arr_str) {
        return compareArray(a,b);
    }
    return (a === b);
}

/*** compare two objects */
export const compareObject = function(objA,objB) {
    var i,a_type,b_type;
    // Compare if they are references to each other 
    if (objA === objB) { return true;}
    if (Object.keys(objA).length !== Object.keys(objB).length) { return false;}
    for (i in objA) {
        if (objA.hasOwnProperty(i)) {
            if (typeof objB[i] === 'undefined') {
                return false;
            }
            else {
                a_type = Object.prototype.toString.apply(objA[i]);
                b_type = Object.prototype.toString.apply(objB[i]);

                if (a_type !== b_type) {
                    return false; 
                }
            }
        }
        if (compare(objA[i],objB[i]) === false){
            return false;
        }
    }
    return true;
}

/*** compare two arrays */
export const compareArray = function (arrayA, arrayB) {
    var a,b,i,l,a_type,b_type;
    // References to each other?
    if (arrayA === arrayB) { return true;}

    if (arrayA.length != arrayB.length) { return false; }
    // sort modifies original array
    // (which are passed by reference to our method!)
    // so clone the arrays before sorting
    a = extendObj(true, [], arrayA);
    b = extendObj(true, [], arrayB);
    a.sort(); 
    b.sort();
    for (i = 0, l = a.length; i < l; i+=1) {
        a_type = Object.prototype.toString.apply(a[i]);
        b_type = Object.prototype.toString.apply(b[i]);

        if (a_type !== b_type) {
            return false;
        }

        if (compare(a[i],b[i]) === false) {
            return false;
        }
    }
    return true;
}

function increment_string_num(str){
    let inc = String(parseInt(str)+1);
    return str.slice(0, str.length-inc.length)+inc;
}

// 'item001' => 'item002'
export const incrementAlphanumericStr = function incrementAlphanumericStr (str){
    if(typeof str ==='number') str = str+"";
    if(typeof str !=='string') return "";
    var numeric = str.match(/\d+$/)[0];
    var prefix = str.split(numeric)[0];
    return prefix+increment_string_num(numeric);
}

require("./numberToWords")
require("./numberToLocaleString")

/*** randomise l'alphabet */
export function randomAlphabet() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

export const randomText = randomAlphabet;

const _classExtends = (ChildClass, ParentClass)=> {
    if(!ChildClass || !ChildClass.prototype) return false;
    let _p = ChildClass.prototype;
    while (_p != null) {
      if (_p == ParentClass.prototype)
        return true;
      _p = _p.__proto__;
    }
    return false;
}

export const classExtends = (ChildClass,ParentClass)=>{
    if(!ChildClass) return false;
    return _classExtends(ChildClass,ParentClass) || 
        (ChildClass.constructor && _classExtends(ChildClass.constructor,ParentClass));
}

export const decodeBase64 = function(base64Str){
    if(isNonNullString(base64Str)){
        if(isBase64(base64Str)){
            return base64.decode(base64Str);
        }
        return base64Str;
    }
    return "";
}
export const fromBase64ToStr = decodeBase64;
export const fromBase64ToString = decodeBase64;

/*** retourne la valeur de chaine de caractère au format base 64 qu'elle trouve
 * si aucune chaine de caractère n'est au format base64, la première chaine de caractère non nulle de la liste
 * est encodée au format base64 et retournée
 */
export const defaultBase64 = function(){
    const args = Array.prototype.slice.call(arguments,0);
    let noBase64 = "";
    for(let i in args){
        const str = args[i];
        if(isNonNullString(str)){
            if(isBase64(str)){
                console.log(str," is found base64",isBase64(str))
                return str;
            }
            if(!noBase64){
                noBase64 = str;
            }
        }
    }
    console.log(noBase64," is not base 64 hein")
    if(noBase64){
        return base64.encode(noBase64);
    }
    return "";
}

function buildFormData(formData, data, parentKey) {
    if (data && typeof data === 'object' && !(data instanceof Date) && !(data instanceof File)) {
      Object.keys(data).forEach(key => {
        buildFormData(formData, data[key], parentKey ? `${parentKey}[${key}]` : key);
      });
    } else {
      const value = data == null ? '' : data;
      formData.append(parentKey, value);
    }
  }
/**** convertis un objet javascript en formData
 * @param {object} data l'objet à convertir en formData
 * @return {FormData}
 */
export const toFormData = Object.toFormData = (data)=>{
    const formData = new FormData();
    buildFormData(formData, data);
    return formData;
}