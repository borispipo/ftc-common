import * as Utils from "$utils";
import {isClientSide} from "$platform/utils";
if(isClientSide()){
    Object.map(Utils,(u,i)=>{
        if(typeof u =="function" && !window[i]){
           window[i] = u;
        }
    })
}
import sprintf from "$utils/sprintf";
import i18n from "$i18n";
import {defaultObj} from "$utils";
import appConfig from "./config";
import Platform from "$platform";
import EVENTS from "./events";
import { observable,addObserver } from "$lib/observable";
import NetInfo from '$utils/NetInfo';


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
    return state.isConnected && typeof state.isInternetReachable =='boolean' ? true : false
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
                    if(APP_INSTANCE.isOnline()){
                        APP_INSTANCE.trigger(EVENTS.GO_ONLINE,newOnlineState)
                    } else {
                        APP_INSTANCE.trigger(EVENTS.GO_OFFLINE,newOnlineState);
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