import session from "$session";
import isNonNullString from "$cutils/isNonNullString";
import defaultLang from "./defaultLang";

const sessionKey = "i18n.lang.session";

export const getLang = ()=>{
    let l = session.get(sessionKey);
    return isNonNullString(l)? l : defaultLang;
}

export const setLang = (lang)=>{
    lang = isNonNullString(lang)? lang : defaultLang;
    session.set(sessionKey,lang);
    return lang;
}