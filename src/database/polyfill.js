const {encode,decode} = require("$clib/base-64");

if (!window.btoa) {
    window.btoa = encode;
}
if (!window.atob) {
    window.atob = decode;
}

require("./fetch.js")

module.exports =  {encode,decode}