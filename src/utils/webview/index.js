export const canPostWebviewMessage = ()=>{
    if(typeof window !=="undefined" || !window || ! window?.ReactNativeWebView || typeof window?.ReactNativeWebView?.postMessage !=="function") return false;
    return true;
}

/*** permet d'envoyer un message webview depuis l'interface client
    @param {string} event, l'évènement lié au message
    @param {any} data, la données à envoyer
*/
export const postWebviewMessage = (event,data)=>{
    if(!canPostMessage()) return false;
    data = Object.assign({},data);
    return window.ReactNativeWebView.postMessage({
        event : event || "EXPO_UI_MESSAGE",
        data,
        source : "EXPO_UI_MESSAGE",
    });
}