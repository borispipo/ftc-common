const {encode,decode} = require("$clib/base-64");

if(typeof window !='undefined' && window){
    if (!window.btoa) {
        window.btoa = encode;
    }
    if (!window.atob) {
        window.atob = decode;
    }
    require("./fetch.js")
}


module.exports =  {encode,decode}