import {ToastAndroid } from 'react-native';
import React from "react";
import {isAndroid} from "$cplatform";
import { notifyRef,notificationRef,TYPES} from "$cnotify";

export {default} from "$cnotify";

notifyRef.current = (options)=>{
    if(type == TYPES.info && isAndroid()){
        return ToastAndroid.show(React.getTextContent(options.message),options.interval);
    }
    if(!notificationRef.current || !notificationRef.current.alertWithType) return;
    return notificationRef.current.alertWithType(options);
}

export * from "$cnotify";