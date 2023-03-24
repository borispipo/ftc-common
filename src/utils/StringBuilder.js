// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import {sprintf} from "./string";

/*** stringBuilder like c# stringBuilder */

function StringBuilder(value) {
    this.strings = [];
    this.append(value);
}
const append = function (value,withline) {
    if(typeof value =='string' && !value) return this;
    if(typeof value !='string'){
        value = value +"";
    }
    if(!value){
        return this;
    }
    this.strings.push(value+(withline?"\n":""));
    return this;
};
StringBuilder.prototype.append = function(value){
    return append.call(this,value);
}

StringBuilder.prototype.clear = function () {
    this.strings = [];
    return this;
}

StringBuilder.prototype.toString = function () {
    return this.strings.join("");
}
StringBuilder.prototype.appendLine = function(value){
    return append.call(this,value,true);
}

StringBuilder.prototype.sprintf = StringBuilder.prototype.appendFormat = function(){
    return append.call(this,sprintf(Array.prototype.slice.call(arguments,0)));
}
export default StringBuilder;