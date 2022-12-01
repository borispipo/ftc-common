// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import APP from "./instance";
import appConfig from "$capp/config";
import {isPromise} from "$cutils";

export default function initApp(options){
    options = defaultObj(options);
    APP.checkOnline();
    const cb = ()=>{
        APP.trigger(APP.EVENTS.INITIALIZED)
    };
    ///la fonction d'initialisation est définie dans appConfig.init
    const init = appConfig.get("init");
    if(typeof init =='function'){
        const r = init();
        if(isPromise(r)){
            return r.then(cb);
        } else if(r !== false){
            ///si init retourne falsd, alors l'évènement initialized ne sera pas trigger par la fonction init de APP mais certainement par la fonciton init en elle meme
            setTimeout(cb,5000);
        }
    }
    return Promise.resolve({}).then(cb);
}