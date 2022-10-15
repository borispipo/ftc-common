// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import React from "$react";

export default function timeout(ms, promise,errorArgs) {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        errorArgs = defaultObj(errorArgs);
        reject(new Error({msg:"le temps de réponse expiré!!le serveur où la ressource demandée peut ne pas être disponible",...React.getOnPressArgs(errorArgs)}))
      }, ms)
      promise.then(resolve, reject)
    })
  }