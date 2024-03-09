import {isReactNativeWebview} from "../../platform/utils";
export const canPostWebviewMessage = ()=>{
    return isReactNativeWebview();
}

export const WEBVIEW_EXPO_UI_MESSAGE = "EXPO_UI_MESSAGE";

export const WEBVIEW_LOG_EVENT = "WEBVIEW_LOG_EVENT";

export const WEBVIEW_FILE_SAVER_SAVE_FILE = "WEBVIEW_FILE_SAVER_SAVE_FILE";

/*** 
    permet d'afficher les messages logs au niveau de la webview
*/
export const logRNWebview = (...rest)=>{
    if(!canPostWebviewMessage()) return false;
    let message = "";
    rest.map((s)=>{
        if(s !== undefined && s!== null){
            try {
                s = JSON.stringify(s);
                if(s){
                    message += `${message? " ":""} ${s}`;
                }
            } catch(e){}
        }
    });
    if(message){
        postWebviewMessage(WEBVIEW_LOG_EVENT,{
            message,
        });
        return true;
    }
    return false;
}
/*** permet d'envoyer un message webview depuis l'interface client
    @param {string} event, l'évènement lié au message
    @param {any} data, la données à envoyer
*/
export const postWebviewMessage = (event,data)=>{
    if(!canPostWebviewMessage()) return false;
    data = Object.assign({},data);
    return window.ReactNativeWebView.postMessage(JSON.stringify({
        event : event || WEBVIEW_EXPO_UI_MESSAGE,
        data,
        source : WEBVIEW_EXPO_UI_MESSAGE,
    }));
}