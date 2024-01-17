const htmlTemplate = require("./pdfmake.html");
import React from "$react";
import WebView from "$ecomponents/WebView";
import View from "$ecomponents/View";
import {isObj,isBase64} from "$cutils";

export const methodsNames = ["createPdf"];

export const webViewRef = React.createRef();

export const Provider = React.forwardRef(({onLoadEnd},ref)=>{
    const style = {display : "none",opacity : 0,width : 0,height : 0};
    return <View ref={ref} style={style}>
        <WebView.Local
            style = {style}
            originWhitelist={["*"]}
            file = {htmlTemplate}
            ref = {webViewRef}
            onMessage = {(event)=>{
                if(typeof webViewRef.current?.onMessage ==="function"){
                    webViewRef?.current.onMessage(event?.nativeEvent?.data);
                }
            }}
            onLoadEnd={(event) => {
                if(typeof onLoadEnd =='function'){
                    onLoadEnd({event,webViewRef,chartContext});
                }
            }}
        >
        </WebView.Local>
    </View>
});

const decycle = (options)=>{
    for(let i in options){
        if(["content","text"].includes(i)) continue;
        if(typeof options[i] =="function"){
             options[i] = String(options[i]);
        }
        if(isObj(options[i])){
            const o = options[i];
            for(let j in o){
                if(["content","text"].includes(j)) continue;
                if(typeof o[j] =="function"){
                    o[j] = String(o[j]);
                }
            }
        }
    }
    return options;
}

/*** les options de la fonction createPdf
    @options 
*/
export const createPdf = (method,options)=>{
    if(!webViewRef.current) return Promise.reject({message:"pdf webview not available"});
    options = decycle(options);
    return new Promise((resolve,reject)=>{
        webViewRef.current.onMessage = (data)=>{
            if(isBase64(data)){
                resolve(data);
            } else {console.error(data,"creating pdfmake");reject({message:data})}
        }
        webViewRef.current.injectJavaScript(`
            const method = "${method}";
            const options = ${JSON.stringify(options)};
            if(!window.pdfMake || typeof pdfMake.createPdf !='function') return;
            try {
                const pdfDocGenerator = pdfMake.createPdf(docDefinition);
                pdfDocGenerator.getBase64((data) => {
                	window.ReactNativeWebView.postMessage(data);
                });
            } catch (e){window.ReactNativeWebView.postMessage(e?.toString())}
        `);
    });
};

Provider.displayName = "Provider.Native";

export default createPdf;