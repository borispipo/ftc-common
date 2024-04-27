import session from "$session";
import currencies from "$ccurrency/currencies";
import {isValidCurrency} from "$ccurrency/utils";
import isNonNullString from "$cutils/isNonNullString";

export const defaultCurrencyFormat = "%v %s";

export const getCurrencyFormat = (force)=>{
    const r = session.get("currencyFormat");
    return r && typeof r =="string" && r.contains("%v")? r : force !== false ? defaultCurrencyFormat:"";
}
export const setCurrencyFormat = (format)=>{
    format = format && typeof format =="string"? format.trim() : "";
    return session.set("currencyFormat",format);
}
export const setCurrency = (currency)=>{
    if(!isValidCurrency(currency)){
        let cCode = typeof currency =="object" && currency && !Array.isArray(currency) ? currency.code : typeof currency =="string" ? currency : undefined;
        if(cCode){
            cCode = cCode.trim().toUpperCase();
        }
        if(cCode && isValidCurrency(currencies[cCode])){
            currency = currencies[cCode];
        } else if(typeof currency =='string') {
            cCode = currency.trim().toUpperCase();
            if(isValidCurrency(currencies[cCode])){
                currency = currencies[cCode];
            }
        }
    }
    currency = Object.assign({},currency);
    const format = getCurrencyFormat();
    if(format){
        currency.format = format;
    }
    return session.set("appConfigCurrency",currency);
}

export const getCurrency = ()=> {
    let currency = Object.assign({},session.get("appConfigCurrency"));
    const currencyCode = session.get("currencyCode");
    if(isNonNullString(currencyCode) && isValidCurrency(currencies[currencyCode.trim().toUpperCase()])){
        currency = {...currencies[currencyCode.trim().toUpperCase()],...currency};
    }
    const format = getCurrencyFormat(false);
    if(isNonNullString(format) && format.includes("%v")){
        currency.format = format;
    }
    return currency;
};

export {currencies};