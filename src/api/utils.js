// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import {defaultObj,defaultNumber} from "$cutils";
import React from "$react";
import i18n from "$i18n";
import appConfig from "$capp/config";

export * from "./host";

export const canCheckOnline = !!!process.env.RUN_API_OFFLINE;
export const canFetchOffline = !canCheckOnline;

///delay d'attente de connexion : peut être définie dans la variable d'environnement API_FETCH_TIMEOUT
const t = process.env.API_FETCH_TIMEOUT && (typeof process.env.API_FETCH_TIMEOUT =='string'? parseInt(process.env.API_FETCH_TIMEOUT):process.env.API_FETCH_TIMEOUT); 
export const getFetchDelay = x=> defaultNumber(appConfig.get("apiFetchTimeout"),t,60000);

export async function timeout(promise,delay,errorArgs) {
    delay = typeof delay =='number' && delay || getFetchDelay();
    return new Promise(function(resolve, reject) {
      const tt = setTimeout(function() {
          errorArgs = defaultObj(errorArgs);
          reject({message:i18n.lang("api_timeout"),...React.getOnPressArgs(errorArgs)})
      }, delay);
      return promise.then(resolve).catch(reject).finally(()=>{
        clearTimeout(tt);
      });
    });
}