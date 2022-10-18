// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {ToastAndroid } from 'react-native';
import React from "react";
import {isAndroid} from "$cplatform";
import { notifyRef,notificationRef,TYPES} from "$cnotify";

export {default} from "$cnotify";

notifyRef.current = (options)=>{
    if(options.type == TYPES.info && isAndroid()){
        return ToastAndroid.show(React.getTextContent(options.message),options.interval);
    }
    if(!notificationRef.current || !notificationRef.current.alertWithType) return;
    return notificationRef.current.alertWithType(options);
}

export * from "$cnotify";