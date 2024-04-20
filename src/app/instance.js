// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import mainGlobal from "$cutils/global";
import * as Utils from "$cutils";
import {isObj, isNonNullString} from "$cutils";
import {isClientSide,isElectron} from "$cplatform/utils";
if(isClientSide() && typeof window !=='undefined' && typeof window ==='object'){
    Object.map(Utils,(u,i)=>{
        if(typeof u =="function" && !window[i]){
           window[i] = u;
        }
    })
}
import sprintf from "$cutils/sprintf";
import i18n from "$ci18n";
import {defaultObj} from "$cutils";
import appConfig from "./config";
import EVENTS from "./events";
import { observable,addObserver,isObservable} from "$clib/observable";
import NetInfo from '$cutils/NetInfo';

const setTitle = (title,cb)=>{
    APP_INSTANCE.previousTitle = APP_INSTANCE.currentTitle || title;
    APP_INSTANCE.trigger(APP_INSTANCE.EVENTS.SET_TITLE,title,cb);
};

const onlineStateRef = {current:null};
export const getOnlineState = x=>onlineStateRef.current && typeof onlineStateRef.current =='object' ? onlineStateRef.current : {};

export const isOnline = x =>{
    const state = getOnlineState();
    return state.isConnected ? true : false;
}

export const checkOnline = ()=>{
    return new Promise((resolve,reject)=>{
        const hasNotInternet = (error)=>{
            reject({msg:i18n.lang("please_check_your_network"),...defaultObj(error)});
            onlineStateRef.current = {};
        };
        NetInfo.fetch().then((state)=>{
            onlineStateRef.current = state;
            if(!isOnline()){
               return hasNotInternet();
            }
            resolve(state);
            return state;
         }).catch((e)=>{
           console.log(e," is network error");
           hasNotInternet(e);
         })
    });
}
const electronMessageApi = typeof window === 'undefined' ? null : isClientSide() && isElectron() && isObj(mainGlobal.ELECTRON) && mainGlobal.ELECTRON.version && 
    (isObj(mainGlobal.electronIpcRenderCustomRender) && mainGlobal.electronIpcRenderCustomRender || {})
|| null;

const APP_INSTANCE = isObj(mainGlobal.APP) ? mainGlobal.APP : {
    get NAME (){
        return appConfig.name;
    },
    get config (){
        return appConfig;
    },
    get name () {
        return appConfig.name;
    },
    get getName (){
        return x=> appConfig.name;
    },
    get getDevWebsite(){
        return appConfig.get("devWebsite","website")
    },
    get getVersion (){
        return x=> appConfig.version;
    },
    get version (){
        return appConfig.version;
    },
    get getInstance(){
        return ()=>{
            initAppInstance();
            return APP_INSTANCE;
        }
    },
    get checkOnline(){
        return checkOnline;
    },
    get EVENTS(){
        return EVENTS;
    },
    get getOnlineState (){
        return getOnlineState;
    },
    get setOnlineState(){
        return (newOnlineState)=>{
            const prevState = getOnlineState();
            onlineStateRef.current = newOnlineState;
            if(newOnlineState &&  prevState.isConnected !== newOnlineState.isConnected){
                const isOn = isOnline();
                if(isOn){
                    APP_INSTANCE.trigger(EVENTS.GO_ONLINE,newOnlineState)
                } else {
                    APP_INSTANCE.trigger(EVENTS.GO_OFFLINE,newOnlineState);
                }
            }
        };
    },
    get isOnline (){
        return isOnline;
    },
    get getTotalRAM(){
        return (unit)=>{
            if(!isClientSide() || !isElectron()) return 0;
            if(!ELECTRON.DEVICE || !isFunction(ELECTRON.DEVICE.getTotalRAM)) return 0;
            return ELECTRON.DEVICE.getTotalRAM(unit);
        };
    },
    get getFreeRAM (){
        return (unit)=>{
            if(!isClientSide() || !isElectron()) return 0;
            if(!ELECTRON.DEVICE || !isFunction(ELECTRON.DEVICE.getFreeRAM)) return 0;
            return ELECTRON.DEVICE.getFreeRAM(unit);
        };
    },
    get setTitle(){
        return setTitle;
    },
    get sprintf() {
       return sprintf;
    },
    get DEVICE (){
        return { }
    },
    get onElectron(){
        return (event,callback)=>{
            if(!electronMessageApi || !isNonNullString(event)) return false;
            return electronMessageApi.on(event,callback)
        }
    },
    get offElectron(){
        return (event,callback)=>{
            if(!electronMessageApi || typeof electronMessageApi.off !='function') return false;
            return electronMessageApi.off(event,callback);
        }
    },
    get offAllElectron(){
        return (event,callback)=>{
            if(!electronMessageApi || typeof electronMessageApi.offAll !='function') return false;
            return electronMessageApi.offAll(event,callback);
        }
    },
    get oneElectron(){
        return (event,callback)=>{
            if(!electronMessageApi || typeof electronMessageApi.once !='function') return false;
            return electronMessageApi.once(event,callback);
        }
    },
};
export const initAppInstance = ()=>{
    if(!isObservable(APP_INSTANCE)){
        observable(APP_INSTANCE);
        addObserver(APP_INSTANCE);
    }
}
if(!isObj(mainGlobal.APP) || !mainGlobal.APP){
    Object.defineProperties(mainGlobal,{
        APP : {value : APP_INSTANCE,override:false,writable:false}
    });
} 
if(electronMessageApi){
    if(typeof electronIpcRenderCustomRender !=='object' && !isObj(mainGlobal.electronIpcRenderCustomRender)){
        mainGlobal.electronIpcRenderCustomRender  = electronMessageApi;
    } 
    if(!isObservable(electronMessageApi)){
        observable(electronMessageApi);
        addObserver(electronMessageApi);
    }
    if(!mainGlobal.hasDeclaredElectronOnMessage && typeof mainGlobal.addEventListener =='function'){
        mainGlobal.hasDeclaredElectronOnMessage = true;
        mainGlobal.addEventListener("message", function(event) {
            // event.source === window means the message is coming from the preload
            // script, as opposed to from an <iframe> or other source
            if (/*event.origin === "file://" &&*/ event.source === window) {
                if(!isObj(event.data) || !event.data.message || typeof event.data.message !=='string' || !event.data.message.startsWith("ELECTRON_MESSAGE/")){
                    return ;
                }
                const {message:cMessage,params:cParams,...rest} = event.data;
                const message = cMessage.trim().ltrim("ELECTRON_MESSAGE/");
                const params = Array.isArray(cParams)? cParams : [];
                params.unshift(message);
                switch(message){
                    case "GET_APP_INSTANCE" :
                        if(typeof ELECTRON.onGetAppInstance =="function"){
                            return ELECTRON.onGetAppInstance(APP_INSTANCE);
                        } 
                        break;
                }
                if(typeof electronMessageApi.trigger =='function'){
                    electronMessageApi.trigger.call(electronMessageApi,params);
                }   
            }
        });
    }
}

initAppInstance();
export default APP_INSTANCE;