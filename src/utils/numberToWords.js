/**@see : https://github.com/yamadapc/js-written-number*/
import defaultStr from "$cutils/defaultStr";
const writtenNumber = require('written-number');
export default function numberToWords(number,options){
    if(isNonNullString(options)){
        options = {lang:options};
    }
    options = options && typeof options =="object" ? options : {};
    options.lang = defaultStr(options.lang,'fr');
    return writtenNumber(number,options);
};
Number.prototype.formatWord = function(language,withCurrency){
    if(isBool(language)){
        let t = withCurrency;
        withCurrency = language;
        language = t;
    }
    withCurrency = typeof(withCurrency) =="boolean" ? withCurrency : false;
    language = defaultStr(language,'fr');
    let number = this.valueOf(), decimalPart = "",zeroParts = "";
    let ret = number.formatNumber();
    try {
        ret = writtenNumber(Math.trunc(number),{lang:language});
        let currency = APP && APP.getDefaultCurrency ? APP.getDefaultCurrency() : {};
        if(currency && isDecimal(currency.decimal_digits) && currency.decimal_digits > 0){
            decimalPart = number.toFixed(currency.decimal_digits);
            if(decimalPart.contains(".")){
                decimalPart = decimalPart.split(".")[1];
            }
            if(decimalPart){
                if(decimalPart.startsWith("0")){
                    zeroParts = "";
                    for(let i = 0; i < decimalPart.length; i++){
                        if(!decimalPart.charAt(i) || decimalPart.charAt(i) !== "0") break;
                        zeroParts +=" zéro";
                    }
                }
                decimalPart = parseInt(decimalPart.ltrim(zeroParts.replaceAll("zero","0").replaceAll(" ","")));
                if(isNumber(decimalPart) && decimalPart){
                    decimalPart = writtenNumber(decimalPart,{lang:language});
                    ret += " virgule"+zeroParts+" "+decimalPart;
                } 
            }   
        }
        if(withCurrency && currency){
            if(currency.name_plural){
                ret +=" "+currency.name_plural+"."
            }
        }
    } catch (e){
        console.log(e,' format number to word')
    } finally{
    }
    return ret;
}