// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import React from "react";
import {isNonNullString,defaultNumber,defaultObj,defaultVal,isObj,defaultStr} from "$cutils";
export const TYPES = {
    info : "info",
    error : "error",
    success : "success",
    warning : 'warn',
}

const notificationRef = React.createRef(null);

export {notificationRef};
export const notifyRef = React.createRef();
export const notify = function(message,type,title,settings){
    if(typeof notifyRef.current !=='function') return;
    type = defaultStr(type).toLowerCase();
    if(isObj(message)){
        settings = message;
        type = type || settings.type;
        title = title || settings.title || undefined;
        message = settings.message || settings.msg;
    }
    if(isObj(title)){
        settings = isObj(settings)? settings : title;
        type = type || settings.type;
        title = settings.title;
    }
    settings = defaultObj(settings);
    type = defaultStr(type,settings.type);
    if(type =="warning"){
        type = TYPES.warning;
    } else if(!TYPES[type]){
        type = TYPES.info;
    }
    if(!(message)) message = ''
    if(!(title)) title = ''
    message = defaultVal(message,settings.message,settings.msg);
    if(isNonNullString(message)){
        message = message.trim();
    }
    if(!message) return;
    settings.title = defaultVal(title,settings.title);
    if(isNonNullString(title)){
        title = title.trim();
    }
    let _t = defaultStr(settings.type,type);
    let defInterval = 5000;
    switch(_t.toLowerCase().trim()){
        case TYPES.error:
            defInterval = 10000;
            break;
        case TYPES.warning:
            defInterval = 8000;
            break;
    }
    if(!title){
        if(type ===TYPES.error){
            title = "Erreur";
        }else if(type ==TYPES.warning){
            title = "Alerte";
        } else title = defaultStr(TYPES[type]).toUpperCase();
    }
    const interval = defaultNumber(settings.interval,settings.timeout,defInterval)
    const payload = isObj(settings.payload)? settings.payload : undefined;
    const options = {...settings,type, title, message, payload, interval};
    return notifyRef.current(options);
}
export const error = (message,title,set)=>{
    return notify(message,TYPES.error,title,set)
}

export const success = (message,title,set)=>{
    return notify(message,TYPES.success,title,set)
}

export const info = (message,title,set)=>{
    return notify(message,TYPES.info,title,set)
}

export const warning = (message,title,set)=>{
    return notify(message,"warning",title,set)
}


export const  toast =  info;

export default {error,success,warning,info,toast,notify};
