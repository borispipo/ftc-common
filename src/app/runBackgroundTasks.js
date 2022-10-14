import APP from "$capp/instance";

const runBackgroundTasks = APP.runBackgroundTasks = (force)=>{
    return new Promise((resolve,reject)=>{
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