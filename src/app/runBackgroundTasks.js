// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import APP from "$capp/instance";
import config from "$capp/config";
import isPromise from "$cutils/isPromise";

export const timeoutDelai = 5*1000*60; //3 minutes

const timeoutRef = {current:null};

const runBackgroundTasks = APP.runBackgroundTasks = (force)=>{
    return new Promise((resolve,reject)=>{
        if(!config.canRunBackgroundTasks()){
            return resolve(true);
        }
        if(APP.isBackgroundTaskRunning){
            reject({status:false,msg:"Une autre intence des tâches d'arrière plan est en cours"})
            return;
        }
        APP.checkOnline().finally(()=>{
            const callback = ()=>{
                clearTimeout(timeoutRef.current);
                APP.isBackgroundTaskRunning = false;
            }
            let timeout = config.get("backgroundTasksDelai","backgroundTasksTimeout");
            if(typeof timeout !== 'number' || !timeout){
                timeout = timeoutDelai;
            }
            const args = {isOnline:APP.isOnline(),callback};
            timeoutRef.current = setTimeout(callback,timeout);
            const rBgTask = config.runBackgroundTasks;
            if(typeof rBgTask =='function'){
                const rp = rBgTask(args);
                if(!isPromise(rp)){
                    console.error("La fonction runBackgroundTask du fichier de configuration de l'application, doit retourner une promesse");
                    return;
                }
                clearTimeout(timeoutRef.current);
                rp.finally(callback);
            }
            ///le trigger RUN_BACKGROUND_TASK prend en paramètre la props isOnline permettant de déterminer si l'app est en ligne
            //et la fonction callback de rappel à appeler automatiquement lorsque la fonction run backgroundTasks est appelée
            //si la fonction runBackgroundTask est définie dans le fichier de configuration, alors on aura pas besoin d'exécuter la fonction callback en argument de ladite fonction
            APP.trigger(APP.EVENTS.RUN_BACKGROUND_TASKS,args);
        });
    })
};

export default runBackgroundTasks;