import storage from "./web/storage";
import {isJSON, parseJSON,stringify} from "$cutils/json"
import {isNonNullString} from "$cutils";
import {prefixStrWithAppId} from "$capp/config";
import isDateObj from "$cutils/isDateObj";
function extend () {
    var i = 0;
    var result = {};
    for (; i < arguments.length; i++) {
        var attributes = arguments[ i ];
        for (var key in attributes) {
            result[key] = attributes[key];
        }
    }
    return result;
}

function decode (s) {
    return s.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
}

function init (converter) {
    function api() {}

    /*** 
     * @param expire : la durée de la session en milliseconds
     */
    function set (key, value, attributes,success) {
        key = prefixStrWithAppId (key);
        var oldValue = value,oldKey = key;
        if(typeof attributes === 'function'){
            if(success && typeof success == 'object'){
                attributes = success;
            }
            success = attributes;
        }
        success = typeof success == 'function'? success : function(){};
        if(!attributes | typeof attributes != 'object'){
            attributes = {};
        }
        
        attributes = extend({
            path: '/'
        }, api.defaults, attributes);

        if (typeof attributes.expires === 'number') {
            attributes.expires = new Date(new Date() * 1 + attributes.expires * 864e+5);
        }

        // We're using "expires" because "max-age" is not supported by IE
        attributes.expires = isDateObj(attributes.expires) ? attributes.expires.toUTCString() : '';

        try {
            var result = stringify(value);
            if (/^[\{\[]/.test(result)) {
                value = result;
            }
        } catch (e) {}

        value = converter.write ?
            converter.write(value, key) :
            encodeURIComponent(String(value))
                .replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);

        key = encodeURIComponent(String(key))
            .replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
            .replace(/[\(\)]/g, escape);

        var stringifiedAttributes = '';
        for (var attributeName in attributes) {
            if (!attributes[attributeName]) {
                continue;
            }
            stringifiedAttributes += '; ' + attributeName;
            if (attributes[attributeName] === true) {
                continue;
            }

            // Considers RFC 6265 section 5.2:
            // ...
            // 3.  If the remaining unparsed-attributes contains a %x3B (";")
            //     character:
            // Consume the characters of the unparsed-attributes up to,
            // not including, the first %x3B (";") character.
            // ...
            stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
        }
        if(key =="com.ftc.apps.salite1-CURRUSERSESSIONNAME"){
            console.log("will set ",value)
        }
        return storage.set(key,value + stringifiedAttributes,(val)=>{
            success.call(api,oldValue,oldKey);
        })
        //return api;
    }

    var _handleRetrievedCookie = function(key,cookies){
        if(!isNonNullString(cookies)) cookies = '';
        cookies = cookies.split('; ');
        var jar = {};
        var i = 0;
        for (; i < cookies.length; i++) {
            var parts = cookies[i].split('=');
            var cookie = parts.slice(1).join('=');
            
            try {
                var name = decode(parts[0]);
                cookie = (converter.read || converter)(cookie, name) ||
                    decode(cookie);

                if (isJSON(cookie)) {
                    try {
                        cookie = parseJSON(cookie);
                    } catch (e) {}
                }

                jar[name] = cookie;
                //console.log(name,key,cookie,' is valies')

                if (key === name) {
                    break;
                }
            } catch (e) {}
        }
        var r = key ? jar[key] : jar;
        if(isJSON(r)){
            r = parseJSON(r);
        }
        return r;
    }
    function get (key,success) {
        key = prefixStrWithAppId (key);
        success = typeof success =='function'? success : function(){};
        let g = storage.get(key,(v)=>{
            success.call(api,_handleRetrievedCookie(key,v));
        });
        if(key =="com.ftc.apps.salite1-CURRUSERSESSIONNAME"){
            console.log("has set ",key,_handleRetrievedCookie(key,g));
        }
        return _handleRetrievedCookie(key,g)
    }

    api.set = set;
    api.get = get;
    api.getJSON = get;
    api.remove = function (key, attributes,success) {
        if(typeof attributes ==='function'){
            if(typeof success != 'function'){
                success = attributes;
            }
            attributes = {};
        }
        if(!attributes | typeof attributes !='object'){
            attributes = {};
        }
        return set(key, '', extend(attributes, {expires: -1}),success);
    };

    api.defaults = {
        expires: 365 //default, cookies will expires after 365 days //update by boris fouomene
    };

    api.withConverter = init;

    return api;
}

const session = init(function () {});
const {get,set,getJSON,remove} = session;
export default session;

export {get,set,getJSON,remove};
