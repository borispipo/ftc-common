import {ToastAndroid } from 'react-native';
import React from "react";
import {isAndroid} from "$platform";
import { notifyRef,TYPES} from "$notify";

export {default} from "$notify";

const notificationRef = React.createRef(null);

export {notificationRef};

notifyRef.current = (options)=>{
    if(type == TYPES.info && isAndroid()){
        return ToastAndroid.show(React.getTextContent(options.message),options.interval);
    }
    if(!notificationRef.current || !notificationRef.current.alertWithType) return;
    return notificationRef.current.alertWithType(options);
}

export * from "$notify";