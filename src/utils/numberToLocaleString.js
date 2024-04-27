// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import defaultStr from "$cutils/defaultStr";
import fNumber from "./formatNumber";
import Currency from "$ccurrency";
import isNonNullString from "./isNonNullString";

// Got this from MDN:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString#Example:_Checking_for_support_for_locales_and_options_arguments
function toLocaleStringSupportsLocales() {
    var number = 0;
    try {
        number.toLocaleString("i");
    } catch (e) {
        return e.name === "RangeError";
    }
    return false;
}

if (!toLocaleStringSupportsLocales()) {
    var replaceSeparators = function(sNum, separators) {
        var sNumParts = sNum.split('.');
        if (separators && separators.thousands) {
            sNumParts[0] = sNumParts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + separators.thousands);
        }
        sNum = sNumParts.join(separators.decimal);

        return sNum;
    };

    var renderFormat = function(template, props) {
        for (var prop in props) {
            if (props[prop].indexOf('-') !== -1) {
                props[prop] = props[prop].replace('-', '');
                template = '-' + template;
            }
            template = template.replace("{{" + prop + "}}", props[prop]);
        }

        return template;
    };

    var mapMatch = function(map, locale) {
        var match = locale;
        var language = locale && locale.toLowerCase().match(/^\w+/);

        if (!map.hasOwnProperty(locale)) {
            if (map.hasOwnProperty(language)) {
                match = language;
            } else {
                match = "en";
            }
        }

        return map[match];
    };

    var dotThousCommaDec = function(sNum) {
        var separators = {
            decimal: ',',
            thousands: '.'
        };

        return replaceSeparators(sNum, separators);
    };

    var commaThousDotDec = function(sNum) {
        var separators = {
            decimal: '.',
            thousands: ','
        };

        return replaceSeparators(sNum, separators);
    };

    var spaceThousCommaDec = function(sNum) {
        var seperators = {
            decimal: ',',
            thousands: '\u00A0'
        };

        return replaceSeparators(sNum, seperators);
    };

    var apostrophThousDotDec = function(sNum) {
        var seperators = {
            decimal: '.',
            thousands: '\u0027'
        };

        return replaceSeparators(sNum, seperators);
    };

    var transformForLocale = {
        en: commaThousDotDec,
        'en-GB': commaThousDotDec,
        'en-US': commaThousDotDec,
        it: dotThousCommaDec,
        fr: spaceThousCommaDec,
        de: dotThousCommaDec,
        "de-DE": dotThousCommaDec,
        "de-AT": dotThousCommaDec,
        "de-CH": apostrophThousDotDec,
        "de-LI": apostrophThousDotDec,
        "de-BE": dotThousCommaDec,
        "nl": dotThousCommaDec,
        "nl-BE": dotThousCommaDec,
        "nl-NL": dotThousCommaDec,
        ro: dotThousCommaDec,
        "ro-RO": dotThousCommaDec,
        ru: spaceThousCommaDec,
        "ru-RU": spaceThousCommaDec,
        hu: spaceThousCommaDec,
        "hu-HU": spaceThousCommaDec,
        "da-DK": dotThousCommaDec,
        "nb-NO": spaceThousCommaDec
    };

    var currencyFormatMap = {
        en: "pre",
        'en-GB': "pre",
        'en-US': "pre",
        it: "post",
        fr: "post",
        de: "post",
        "de-DE": "post",
        "de-AT": "prespace",
        "de-CH": "prespace",
        "de-LI": "post",
        "de-BE": "post",
        "nl": "post",
        "nl-BE": "post",
        "nl-NL": "post",
        ro: "post",
        "ro-RO": "post",
        ru: "post",
        "ru-RU": "post",
        hu: "post",
        "hu-HU": "post",
        "da-DK": "post",
        "nb-NO": "post"
    };

    const currencySymbols = {
        "afn": "؋",
        "ars": "$",
        "awg": "ƒ",
        "aud": "$",
        "azn": "₼",
        "bsd": "$",
        "bbd": "$",
        "byr": "p.",
        "bzd": "BZ$",
        "bmd": "$",
        "bob": "Bs.",
        "bam": "KM",
        "bwp": "P",
        "bgn": "лв",
        "brl": "R$",
        "bnd": "$",
        "khr": "៛",
        "cad": "$",
        "kyd": "$",
        "clp": "$",
        "cny": "¥",
        "cop": "$",
        "crc": "₡",
        "hrk": "kn",
        "cup": "₱",
        "czk": "Kč",
        "dkk": "kr",
        "dop": "RD$",
        "xcd": "$",
        "egp": "£",
        "svc": "$",
        "eek": "kr",
        "eur": "€",
        "fkp": "£",
        "fjd": "$",
        "ghc": "¢",
        "gip": "£",
        "gtq": "Q",
        "ggp": "£",
        "gyd": "$",
        "hnl": "L",
        "hkd": "$",
        "huf": "Ft",
        "isk": "kr",
        "inr": "₹",
        "idr": "Rp",
        "irr": "﷼",
        "imp": "£",
        "ils": "₪",
        "jmd": "J$",
        "jpy": "¥",
        "jep": "£",
        "kes": "KSh",
        "kzt": "лв",
        "kpw": "₩",
        "krw": "₩",
        "kgs": "лв",
        "lak": "₭",
        "lvl": "Ls",
        "lbp": "£",
        "lrd": "$",
        "ltl": "Lt",
        "mkd": "ден",
        "myr": "RM",
        "mur": "₨",
        "mxn": "$",
        "mnt": "₮",
        "mzn": "MT",
        "nad": "$",
        "npr": "₨",
        "ang": "ƒ",
        "nzd": "$",
        "nio": "C$",
        "ngn": "₦",
        "nok": "kr",
        "omr": "﷼",
        "pkr": "₨",
        "pab": "B/.",
        "pyg": "Gs",
        "pen": "S/.",
        "php": "₱",
        "pln": "zł",
        "qar": "﷼",
        "ron": "lei",
        "rub": "₽",
        "shp": "£",
        "sar": "﷼",
        "rsd": "Дин.",
        "scr": "₨",
        "sgd": "$",
        "sbd": "$",
        "sos": "S",
        "zar": "R",
        "lkr": "₨",
        "sek": "kr",
        "chf": "CHF",
        "srd": "$",
        "syp": "£",
        "tzs": "TSh",
        "twd": "NT$",
        "thb": "฿",
        "ttd": "TT$",
        "try": "",
        "trl": "₤",
        "tvd": "$",
        "ugx": "USh",
        "uah": "₴",
        "gbp": "£",
        "usd": "$",
        "uyu": "$U",
        "uzs": "лв",
        "vef": "Bs",
        "vnd": "₫",
        "yer": "﷼",
        "zwd": "Z$"
    };

    const currencyFormats = {
        pre: "{{code}}{{num}}",
        post: "{{num}} {{code}}",
        prespace: "{{code}} {{num}}"
    };

    Number.prototype.toLocaleString = function(locale, options) {
        if (locale && locale.length < 2)
            throw new RangeError("Invalid language tag: " + locale);

        var sNum;

        if (options && (options.minimumFractionDigits || options.minimumFractionDigits === 0)) {
            sNum = this.toFixed(options.minimumFractionDigits);
        } else {
            sNum = this.toString();
        }

        sNum = mapMatch(transformForLocale, locale)(sNum, options);

        if(options && options.currency && options.style === "currency") {
            var format = currencyFormats[mapMatch(currencyFormatMap, locale)];
            var symbol = currencySymbols[options.currency.toLowerCase()];
            if(options.currencyDisplay === "code" || !symbol) {
                sNum = renderFormat(format, {
                    num: sNum,
                    code: options.currency.toUpperCase()
                });
            } else {
                sNum = renderFormat(format, {
                    num: sNum,
                    code: symbol
                });
            }
        }

        return sNum;
    };
}
/*** compte le nombre de décimales sur le nombre passé en paramètre */
Number.prototype.countDecimals = function () {
    if(Math.floor(this.valueOf()) === this.valueOf()) return 0;
    let str = this.toString().split(".")[1];
    return str ? str.length : 0; 
}

Number.prototype.formatNumber = function(locale,options){
    let val = this.valueOf();
    let decimals = val.countDecimals();
    if(!isNonNullString(locale)){
        locale = decimals == 0 ? '# ###' : decimals == 1 ? '# ###.#' : decimals == 2 ? '# ###.##' : '# ###.###';
    }
    if(locale.contains("###")){
        return fNumber.formatNumber(val,locale);
    }
    return Number.prototype.toLocaleString.call(this,locale,defaultObj(options))
}

String.prototype.formatNumber = function(locale,options){
    locale = defaultStr(locale,'fr');
    let str = defaultStr(this.toString(),"0")
    let number = str.parseNumber(locale);
    return number.formatNumber(locale,options);
}
/***** parse une chaine de caractère en un nombre */
String.prototype.parseNumber = function(format){
    format = defaultStr(format,'# ###.##');
    let str = defaultStr(this.toString(),"0")
    if(format.contains("###")){
        return fNumber.parseNumber(str,format);
    } else {
        return parseDecimal(str.replaceAll(" ",""))
    }
}
String.prototype.parseToDecimal = function(){
    let v = this.toString() || '';
    let _v = v.replaceAll(("0").formatMoney().replaceAll("0","")," ").trim().replaceAll(" ","");
    let regex = /[+-]?\d+(?:\.\d+)?/g;
    let matches = _v.match(regex);
    if(matches && _v == matches[0]){
        return parseDecimal(_v);
    }
    return v;
}

/*** 
 * formate un nombre en devise : symbol, decimal_digits, thousand, decimal, format
    @param {String} symbol, le symbole de la devise
    @param {number} decimal_digits, le nombre de décimales
    @param {string} thousand, le séparateur de milliers
    @param {string} decimal, le séparateur de décimales
    @param {string} format, le format d'affichage de la dévise par exemple : %s %v .##
    @param {boolean} returnObject, si true alors un objet sera retourné
    @return {string}, le nombre formatté au format money
 */
Number.prototype.formatMoney = function(symbol, decimal_digits, thousand, decimal, format,returnObject){
    return Currency.formatMoney(this.valueOf(),symbol, decimal_digits, thousand, decimal, format,returnObject);
}

/*** 
 * formate un nombre en devise : symbol, decimal_digits, thousand, decimal, format
    @param {String} symbol, le symbole de la devise
    @param {number} decimal_digits, le nombre de décimales
    @param {string} thousand, le séparateur de milliers
    @param {string} decimal, le séparateur de décimales
    @param {string} format, le format d'affichage de la dévise par exemple : %s %v .##
    @return {string}, le nombre formatté au format money
    @param {boolean} returnObject, si true alors un objet sera retourné
 */
String.prototype.formatMoney = function(symbol, decimal_digits, thousand, decimal, format,returnObject){
    return Currency.formatMoney((this.toString().replaceAll(" ",'')),symbol, decimal_digits, thousand, decimal, format,returnObject);
}

/**** @see : https://stackoverflow.com/questions/10599933/convert-long-number-into-abbreviated-string-in-javascript-with-a-special-shortn */
const _abreviateNumber = (num, returnObject) =>{
    if (num === null || typeof num !=='number') { returnObject === true ? {} : null} // terminate early
    const decimals = num.countDecimals();
    let fixed = Math.min(decimals,5);
    fixed = (!fixed || fixed < 0) ? 0 : fixed; // number of decimal places to show
    if (num == 0) { 
        num = num != 0 ? parseFloat(num.toFixed(0 + fixed)) || 0 : 0;
        const nString = num.toString();
        return returnObject === true ? {
            formattedResult :nString,
            value : num,
            format : '',
            suffix : '',
            formattedValue : nString,
        } : nString; 
    } // terminate early
    
    var b = (num).toPrecision(2).split("e"), // get power
        k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3), // floor at decimals, ceiling at trillions
        c = k < 1 ? num.toFixed(0 + fixed) : (num / Math.pow(10, k * 3) ).toFixed(1 + fixed), // divide by power
        d = c < 0 ? c : Math.abs(c), // enforce -0 is 0
        e = d; // append power
    const suffix = ['', 'K', 'M', 'B', 'T'][k];
    const value = parseFloat(e) ||0;
    if(returnObject ===true){
        return {
            formattedValue : e,
            value,
            suffix,
            format : suffix,
            formattedResult : e+suffix,
        }
    }
    return (value).formatNumber()+suffix;
};
export const abreviateNumber = (num)=>{
    return _abreviateNumber(num,false);
}

/*** permet d'abréger un nombre en kilo, ainsi de suite */
Number.prototype.abreviate = function(){
    return abreviateNumber(this.valueOf());
}
/****abbrège un nombre et le formate en devise
 * 
    @param {number} number le nombre a formatter et abréger
    @param {String} symbol, le symbole de la devise
    @param {number} decimal_digits, le nombre de décimales
    @param {string} thousand, le séparateur de milliers
    @param {string} decimal, le séparateur de décimales
    @param {string} format, le format d'affichage de la dévise par exemple : %s %v .##
    @return {string}, le nombre formatté au format money
    @param {boolean} returnObject, si true alors un objet sera retourné
 */
export const abreviate2FormatMoney = (number,symbol, decimal_digits, thousand, decimal, format)=>{
    const {value,format:fStr,formattedValue} = _abreviateNumber(number,true);
    if(typeof value !='number') return formattedValue;
    const {formattedValue:fVal} =  Currency.formatMoney(value,symbol, decimal_digits, thousand, decimal, format,true);
    return fVal.replace('%v',Math.abs(value).formatNumber()+fStr);
}
Number.prototype.abreviate2FormatMoney = Number.prototype.abreviate2formatMoney = function(){
    return abreviate2FormatMoney(this.valueOf());
}