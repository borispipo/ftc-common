
//import * as Clipboard from 'expo-clipboard';
import notify from "$notify";

export const readText = x => Promise.reject({});//Clipboard.getStringAsync();

export const readTextFromClipboard = readText;

export const copyTextToClipboard = (str) => {
    if(typeof str =='number' || typeof str =='boolean'){
        str +="";
    }
    return;
    if(isNonNullString(str)){
        Clipboard.setString(str);
        let str2 = str.length > 153 ? (str.substring(0,150)+"...") : str
        notify.info("["+str2+"]\ncopié avec succèss dans le presse papier");
        return true;
    }
};