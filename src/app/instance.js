// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import * as Utils from "$cutils";
import {extendObj,isObj} from "$cutils";
import {isClientSide,isElectron} from "$cplatform/utils";
if(isClientSide()){
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
import Platform from "$cplatform";
import EVENTS from "./events";
import { observable,addObserver,isObservable,removeObserver } from "$clib/observable";
import NetInfo from '$cutils/NetInfo';
import notify from "$cnotify";

const appWasOfflineRef ={current:false};


let APP_INSTANCE = {
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
};
if(isClientSide() && typeof window !== 'undefined'){
    if((!(window.APP) || typeof window.APP != 'object')){
        Object.defineProperties(window,{
            APP : {value : APP_INSTANCE,override:false,writable:false}
        });
    } else {
        APP_INSTANCE = window.APP;
    }
    
} 


if(!APP_INSTANCE.DEVICE || typeof APP_INSTANCE.DEVICE !=='object'){
    Object.defineProperties(APP_INSTANCE,{
        DEVICE : {
            value : {
                ...{
                    //osVersion: platform.os.version,
                    //os: platform.os.family,
                },
            },
            override : false
        }
    })
}

export const getOnlineState = x=>APP_INSTANCE.___onlineNetworkState && typeof APP_INSTANCE.___onlineNetworkState =='object' ? APP_INSTANCE.___onlineNetworkState : {};
export const checkOnline = ()=>{
    return new Promise((resolve,reject)=>{
        const hasNotInternet = (error)=>{
            reject({msg:i18n.lang("please_check_your_network"),...defaultObj(error)});
            APP_INSTANCE.___onlineNetworkState = {};
        };
        NetInfo.fetch().then((state)=>{
            APP_INSTANCE.___onlineNetworkState = state;
            if(!APP_INSTANCE.isOnline()){
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
export const isOnline = x =>{
    const state = getOnlineState();
    return state.isConnected ? true : false;//&& (typeof state.isInternetReachable =='boolean' || state.type) ? true : false
}

if(!APP_INSTANCE.EVENTS || typeof APP_INSTANCE.EVENTS !=='object'){
    Object.defineProperties(APP_INSTANCE,{
        checkOnline : {
            value :checkOnline
        },
        EVENTS : {value:EVENTS},
        getOnlineState : {
            value : getOnlineState,
        },
        setOnlineState : {
            value : (newOnlineState)=>{
                const prevState = APP_INSTANCE.getOnlineState();
                APP_INSTANCE.___onlineNetworkState = newOnlineState;
                if(newOnlineState &&  prevState.isConnected !== newOnlineState.isConnected){
                    const isOn = APP_INSTANCE.isOnline();
                    if(isOn){
                        APP_INSTANCE.trigger(EVENTS.GO_ONLINE,newOnlineState)
                    } else {
                        APP_INSTANCE.trigger(EVENTS.GO_OFFLINE,newOnlineState);
                        appWasOfflineRef.current = true;
                    }
                    if(appWasOfflineRef.current && appConfig.initialized && appConfig.getConfigValue("notifyOnOnlineStateChange")){
                        notify[!isOn?'warning':'success'](i18n.lang(isOn?"network_connection_restaured":"network_connection_lost"))
                    }
                }
            }
        },
        isOnline : {
            value : isOnline
        },
        getTotalRAM : {
            value : (unit)=>{
                if(!Platform.isElectron() || !ELECTRON.DEVICE || !isFunction(ELECTRON.DEVICE.getTotalRAM)) return 0;
                return ELECTRON.DEVICE.getTotalRAM(unit);
            }, overide : false,
        },
        getFreeRAM : {
            value : (unit)=>{
                if(!Platform.isElectron() || !ELECTRON.DEVICE || !isFunction(ELECTRON.DEVICE.getFreeRAM)) return 0;
                return ELECTRON.DEVICE.getFreeRAM(unit);
            }, overide : false
        },
        setTitle :{
            value : (title,cb)=>{
                APP_INSTANCE.previousTitle = APP_INSTANCE.currentTitle || title;
                APP_INSTANCE.trigger(APP_INSTANCE.EVENTS.SET_TITLE,title,cb);
            },//retour a la page d'acceuil
        },
        sprintf : {
            value : sprintf, overide : false,
        }
    })
}


observable(APP_INSTANCE);
addObserver(APP_INSTANCE);

export default APP_INSTANCE;

if(isElectron() && window.ELECTRON){
    if( (typeof ELECTRON.APP !='object' || !ELECTRON.APP)){
        Object.defineProperties(ELECTRON,{
            APP : {value : APP_INSTANCE,overide:false},
            notify : {value : notify},
        })
    }
    if(isObj(ELECTRON.APP)) {
        for(var i in APP_INSTANCE){
            if(!(i in ELECTRON.APP)){
                ELECTRON.APP[i] = APP_INSTANCE[i];
            }
        }
        if(!isObj(ELECTRON.APP)){ 
            observable(ELECTRON.APP);
            addObserver(ELECTRON.APP);
        }
    }
}