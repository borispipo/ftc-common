const htmlTemplate = require("./pdfmake.html");
import React from "$react";
import WebView from "$ecomponents/WebView";
import View from "$ecomponents/View";
import {isObj,isBase64} from "$cutils";

export const webViewRef = {current:null};

export const Provider = React.forwardRef(({onLoadEnd},ref)=>{
    const style = {display:"none",opacity : 0,width : 0,height : 0};
    return <View ref={ref} style={style}>
        <WebView.Local
            style = {style}
            originWhitelist={["*"]}
            file = {htmlTemplate}
            ref = {(el)=>webViewRef.current = el}
            onMessage = {(event)=>{
                console.log(event?.nativeEvent?.data," has receive message")
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

/*** les options de la fonction createPdf
    @options 
*/
export const createPdf = (options,...rest)=>{
    if(!webViewRef.current) return Promise.reject({message:"pdf webview not available"});
    const str = JSON.stringify(options, (key, val)=> {
        if (typeof val === 'function') {
            return String(val)
        }
        return val
      }, 2);
    return new Promise((resolve,reject)=>{
        webViewRef.current.onMessage = (data)=>{
            console.log(data," is created pdf make");
            if(isBase64(data)){
                resolve(data);
            } else {console.error(data,"creating pdfmake");reject({message:data})}
        }
        webViewRef.current.injectJavaScript(`
            try {
                const options = ${str};
                if(!window.pdfMake) {
                    window.ReactNativeWebView.postMessage("Pdf instance not defined");
                } else {
                    const pdfDocGenerator = window.pdfMake?.createPdf(options);
                    if(typeof pdfDocGenerator.getBase64 ==="function"){
                        pdfDocGenerator.getBase64((data) => {
                            window.ReactNativeWebView.postMessage(data);
                            return data;
                        });
                    } else {
                        window.ReactNativeWebView.postMessage("Invalid pdf options");
                    }
                }
            } catch (e){
                window.ReactNativeWebView.postMessage(e?.toString())
            }
        `);
    });
};

Provider.displayName = "Provider.Native";

export default createPdf;