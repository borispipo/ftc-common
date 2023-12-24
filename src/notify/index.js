// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
/***
 * @namespace notify
 * permet de gérer les différentes notifications de l'application
 */
 import React from "react";
 import {isNonNullString,defaultNumber,defaultObj,defaultVal,isObj,defaultStr} from "$cutils";
 import getTextContent from "../utils/react/getTextContent";
 export const TYPES = {
     info : "info",
     error : "error",
     success : "success",
     warning : 'warn',
 }
 
 const notificationRef = React.createRef(null);
 
 export {notificationRef};
 export const notifyRef = React.createRef();
 export const notify = function(message,type,title,settings){
     if(typeof notifyRef.current !=='function') return;
     type = defaultStr(type).toLowerCase();
     if(isObj(message)){
         settings = message;
         type = type || settings.type;
         title = title || settings.title || undefined;
         message = settings.message || settings.msg;
     }
     if(isObj(title)){
         settings = isObj(settings)? settings : title;
         type = type || settings.type;
         title = settings.title;
     }
     settings = defaultObj(settings);
     type = defaultStr(type,settings.type);
     if(!type || !(type in TYPES)){
        type = TYPES.info;
     }
     if(type =="warning"){
         type = TYPES.warning;
     } else if(!TYPES[type]){
         type = TYPES.info;
     }
     if(!(message)) message = ''
     if(!(title)) title = ''
     message = defaultVal(message,settings.message,settings.msg);
     if(isNonNullString(message)){
         message = message.trim();
     }
     if(!message) return;
     settings.title = defaultVal(title,settings.title);
     if(isNonNullString(title)){
         title = title.trim();
     }
     let _t = defaultStr(settings.type,type);
     let defInterval = 5000;
     switch(_t.toLowerCase().trim()){
         case TYPES.error:
             message = defaultVal(message,settings.error,settings.errorText)
             defInterval = 12000;
             break;
         case TYPES.warning:
             defInterval = 10000;
             break;
     }
     if(!title){
         if(type ===TYPES.error){
             title = "Erreur";
         }else if(type ==TYPES.warning){
             title = "Alerte";
         } else title = defaultStr(TYPES[type]).toUpperCase();
     }
     let interval = defaultNumber(settings.interval,settings.timeout,defInterval);
     if(Math.abs(interval,defInterval)<=200){
        //on définit l'intervalle par défaut en fonction de la longueur du message
        const ccc = getTextContent(message);
        if(ccc){
            interval = Math.max(defInterval,(ccc.length*100));
        }
     }
     const payload = isObj(settings.payload)? settings.payload : undefined;
     const options = {...settings,type, title, message, payload, interval};
     return notifyRef.current(options);
 }
 export const error = (message,title,set)=>{
     return notify(message,TYPES.error,title,set)
 }
 
 export const success = (message,title,set)=>{
     return notify(message,TYPES.success,title,set)
 }
 
 export const info = (message,title,set)=>{
     return notify(message,TYPES.info,title,set)
 }
 
 export const warning = (message,title,set)=>{
     return notify(message,"warning",title,set)
 }
 
 export const canSendDesktop = x=> typeof window ==='undefined' || !window || !window?.Notification || !window?.Notification?.requestPermission ? false: true;
 
 /*** @see : https://developer.mozilla.org/en-US/docs/Web/API/Notification 
    @param {string} message, le message de la notification
    @param {string|object} options, si chaine de caractère, alors il s'agit du titre de la notification, sinon, alors il s'agit des options supplémentaires
 */
 export const sendDesktop = (message,options)=>{
    if(typeof options ==='string'){
        options = {title:options};
    }
    if (!canSendDesktop()) {
        return Promise.resolve(notify(message,null,null,options));
    }
    return Promise.resolve((Notification.permission === 'granted'?Notification.permission:Notification.requestPermission())).then(function(p) {
        if(p === 'granted') {
            options = isObj(options)? options : {};
            return new Notification(message,options)
        } else {
            throw {message:"Notifications Bloqués par l'utilisateur, veuillez autoriser l'affichage des notifications à partir du navigateur."}
        }
    });
 }
 
 export const  toast =  info;
 
 export default {error,success,warning,info,toast,notify,canSendDesktop,sendDesktop,desktop:sendDesktop};
 