// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

export {default as AppStateService} from "./AppStateService";
import APP from "$capp/instance";
import runBackgroundTasks from "$capp/runBackgroundTasks";
import appConfig from "../config";
import {defaultNumber} from "$cutils";

/**** l'intervalle d'attente pour l'exécution des tâches d'arrières plans */
let idleTime = 10000;
let isIDLRunning = false;
let inactiveLastTime = undefined;

const resetDate = x=> new Date().getTime();
export const canRun = ()=>{
    //si l'application a été laissé inactive pendant le temps d'attente, alors, l'opération d'exécution des tâches d'arrière plan est exécutée   
    if(idleTime > 0 && typeof(inactiveLastTime) =="number"){
        return resetDate() - inactiveLastTime > idleTime ? true : false;
    }
    return false;
}

/*** reset idle timeout */
export const resetTimeout = (timeout)=>{
    timeout = typeof timeout =='number' && timeout || appConfig.get("idleTimeout");
    if(typeof timeout =='number' && timeout){
        idleTime = timeout;
    } 
}

export function run(force) {
    if(isIDLRunning && force !== true) return
    isIDLRunning = true;
    runBackgroundTasks(force).catch((e)=>{
        console.error(e," runngin idle heinn");
        return e;
    }).finally(()=>{
        isIDLRunning = undefined;
        inactiveLastTime = resetDate();
    });
}

export default function idle (clearEvents){
    APP.off(APP.EVENTS.STATE_CHANGE,onAppStateChange)
    APP.off("online",run);
    if(clearEvents !== true){
        APP.on(APP.EVENTS.STATE_CHANGE,onAppStateChange);
        APP.on("online",run);
    }
}
export const stop = (runIdle,clearEvents) =>{
    if(runIdle === true){
        run(true);
    }
    idle(clearEvents)
}
export const trackIDLE = (forceRun,clearEvents) =>{
    idle(clearEvents,forceRun);
};

export {stop as stopIDLE};

const onAppStateChange = (nState)=>{
    resetTimeout();
    let {isActive} = nState;
    let cRun = canRun();
    if(isActive){
        if(cRun){
            run(true);
        }
    } else {
        if(cRun){
            run();
        }
        if(!inactiveLastTime || cRun){
            inactiveLastTime = resetDate();
        }
        //stop(cRun);
    }
}


if(typeof APP.stopIDLE !=='function'){
    Object.defineProperties(APP,{
        stopIDLE : {value : stop,overide:false,writable:false},
        trackIDLE : {
            value : trackIDLE, override : false, writable : false
        },
        onScreenFocus :{
            value :  ()=>{
                onAppStateChange({isActive:true});
            }
        },
        onScreenBlur : {
            value : ()=>{
                onAppStateChange({isActive:false});
            }
        },
        resetTimeout : {value : resetTimeout}
    });
    APP.off(APP.EVENTS.SCREEN_FOCUS,APP.onScreenFocus);
    APP.off(APP.EVENTS.SCREEN_BLUR,APP.onScreenBlur);
    APP.ON(APP.EVENTS.SCREEN_FOCUS,APP.onScreenFocus);
    APP.ON(APP.EVENTS.SCREEN_BLUR,APP.onScreenBlur);
}


