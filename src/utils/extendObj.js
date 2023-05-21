// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import isDateObj from "./isDateObj";
export const isPlainObject = function ( obj ) {
    if(typeof obj =='boolean' || typeof obj =='string' || isDateObj(obj)) return false;
    var toString = Object.prototype.toString.call(obj);
    if(toString == '[object global]' || toString == '[object Window]' || toString == '[object DOMWindow]'){
        return false;
    }
    var proto, Ctor;
    // Detect obvious negatives
    // Use toString instead of jQuery.type to catch host objects
    if ( !obj || {}.toString.call( obj ) !== "[object Object]" ) {
        return false;
    }

    proto = Object.getPrototypeOf( obj );

    // Objects with no prototype (e.g., `Object.create( null )`) are plain
    if ( !proto ) {
        return true;
    }
    var class2type = {};
    var toString = class2type.toString;
    var hasOwn = Object.prototype.hasOwnProperty;
    var fnToString = hasOwn.toString;
    var ObjectFunctionString = fnToString.call( Object );

    // Objects with prototype are plain iff they were constructed by a global Object function
    Ctor = hasOwn.call( proto, "constructor" ) && proto.constructor;
    return typeof Ctor === "function" && fnToString.call( Ctor ) === ObjectFunctionString;
}
export const isPlainObj = isPlainObject;
/*** ajout de la fonction filter dans la props extendObj, pour filtrer les paramètres d'extension à la fonction
 *  si la liste des arguments passés en paramètres est supérieure ou égale à deux et que le dernier paramètres est une fonction 
 *  alors celui-ci est considéré comme un filtre sur les props à appeler
 */
export default function extendObj (){
    let options, name, src, copy, copyIsArray, clone,deepArray,filter = x=>true,//si l'on doit copier les tableaux en profondeur
        target = arguments[ 0 ] || {},
        i = 1,
        length = arguments.length,
        deep = false;
    // Handle a deep copy situation
    if ( typeof target === "boolean" ) {
        deep = target;
        // Skip the boolean and the target
        target = arguments[ i ] || {};
        if(typeof target === 'boolean') {
            deepArray = target;
            i++;
            target = arguments[i] || {};
        } 
        i++;
    }
    if(length >=2 && typeof (arguments[length-1]) =="function"){
        filter = arguments[length-1];
        length = length-1;
    }
    // Handle case when target is a string or something (possible in deep copy)
    if ( typeof target !== "object" && !isFunction( target ) ) {
        target = {};
    }

    // Extend jQuery itself if only one argument is passed
    if ( i === length ) {
        target = this;
        i--;
    }

    for ( ; i < length; i++ ) {

        // Only deal with non-null/undefined values
        if ( ( options = arguments[ i ] ) != null ) {

            // Extend the base object
            for ( name in options ) {
                if(typeof(options) ==="object" && options && !Object.prototype.hasOwnProperty.call(options,name)) continue;
                copy = options[ name ];
                // Prevent Object.prototype pollution
                // Prevent never-ending loop
                if ( name === "__proto__" || target === copy || filter(copy,name) === false) {
                    continue;
                }
                copyIsArray = Array.isArray( copy )
                // Recurse if we're merging plain objects or arrays
                if ( deep && copy && ( isPlainObject( copy ) || ( copyIsArray) ) ) {
                    src = target[ name ];
                    // Ensure proper type for the source value
                    if ( copyIsArray && !Array.isArray( src ) ) {
                        clone = [];
                    } else if ( !copyIsArray && !isPlainObject( src ) ) {
                        clone = {};
                    } else {
                        clone = src;
                    }
                    if(copyIsArray && !deepArray){
                        target[name] = copy;
                    } else {
                        copyIsArray = false;
                        // Never move original objects, clone them
                        target[ name ] = extendObj( deep,deepArray, clone, copy,filter);
                    }

                // Don't bring in undefined values
                } else if ( copy !== undefined ) {
                    target[ name ] = copy;
                }
            }
        }
    }

    // Return the modified object
    return target;
}

export function cloneObject(source,cloneLevel) {
    let level = 1;
    if (Array.isArray(source)) {
        const clone = [];
        for (var i=0; i<source.length; i++) {
            clone[i] = cloneObject(source[i],i+1);
        }
        return clone;
    } else if (isPlainObj(source)) {
        const clone = {};
        for (var prop in source) {
            if (source.hasOwnProperty(prop)) {
                clone[prop] = cloneObject(source[prop],level);
                level ++;
            }
        }
        return clone;
    } else {
        if(source === undefined && typeof cloneLevel !=='number'){
            return {};
        }
        return source;
    }
  }
  
  export const cloneObj = Object.clone = Object.copy =  cloneObject;