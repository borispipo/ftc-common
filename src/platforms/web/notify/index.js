import React from "react";
import defaultStr from "$cutils/defaultStr";
import { notifyRef} from "$cnotify";

export {default} from "$cnotify";

const notificationRef = React.createRef(null);

export {notificationRef};

notifyRef.current = (options)=>{
    const type = defaultStr(options.type).toLowerCase();
    if(typeof console[type] =='function'){
        return console[type](options.message,options.type);
    }
    return console.info(options.message)
}

export * from "$cnotify";