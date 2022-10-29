// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import APP from "$capp/instance";
import config from "$capp/config";

const runBackgroundTasks = APP.runBackgroundTasks = (force)=>{
    return new Promise((resolve,reject)=>{
        if(!config.canRunBackgroundTasks()){
            return resolve(true);
        }
        if(APP.isBackgroundTaskRunning){
            reject({status:false,msg:"Une autre intence des tâches d'arrière plan est en cours"})
            return;
        }
        APP.isBackgroundTaskRunning = true;
        APP.checkOnline().finally(()=>{
            APP.trigger(APP.EVENTS.RUN_BACKGROUND_TASKS);
        });
    })
};

export default runBackgroundTasks;