// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import * as ReactIs from "react-is";
import isValidElement from "./isValidElement";


export const isClassComponent = function isClassComponent(component) {
    return typeof component === 'function' && component.prototype &&
    (component.prototype.isReactComponent || typeof component.prototype.render==="function") ? true : false;
}

export const isFunctionComponent = function isFunctionComponent(component) {
    const str = String(component);
    return typeof component === 'function' && ( 
        str.includes('return React.createElement')
        || str.includes('children: (0, _jsxRuntime.jsxs)')
        || component.toString().includes('Component(props)')
    )
}


export const isComponent = function isComponent(component) {
    if(component && ReactIs.isValidElementType(component)) return true;
    return isClassComponent(component) || isFunctionComponent(component) || isElementComponent(component);
}

export const isElementComponent = (component)=>{
    return typeof component =="object" && component && "$$typeof" in component && typeof component.render =="function";
}


export const isDOMTypeElement = function isDOMTypeElement(element) {
    return isValidElement(element) && typeof element.type === 'string';
}

export const isCompositeTypeElement =  function isCompositeTypeElement(element) {
    return isValidElement(element) && typeof element.type === 'function';
}

export const isClass =  function isClass(v) {
    return typeof v === 'function' && /^\s*class\s+/.test(v.toString());
}
