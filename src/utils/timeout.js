import i18n from "$ci18N";
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