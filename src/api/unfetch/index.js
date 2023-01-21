let unfetch = typeof window !=='undefined' && window && typeof XMLHttpRequest !=='undefined' && window.XMLHttpRequest ? require("unfetch").default : undefined;
if(!unfetch){
    if(typeof global !='undefined' && global && typeof global.fetch =='function'){
        unfetch = global.fetch;
    } else if(typeof globalThis != "undefined" && globalThis && typeof globalThis.fetch =='function'){
        unfetch = globalThis.fetch;
    }
}
export default unfetch;
