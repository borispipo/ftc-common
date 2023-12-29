// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import extendObj from "$utils/extendObj";

const signInRef = {};

/**** SignIn2Signout est étendue avec le composant AuthProvider*/
export default {
  get hasMethod(){
    return function(methodName){
        return typeof signInRef[methodName] === "function";
    }
  },
  get getMethod (){
      return (methodName)=>{
        if(this.hasMethod(methodName)){
          return signInRef[methodName];
        }
        return undefined;
      }
  },
  get call (){
    return (methodName,...args)=>{
        const method = this.getMethod(methodName);
        if(method){
            return method(...args);
        }
    }
  },
  get isMasterAdmin(){
    return function(...a){
        if(this.hasMethod("isMasterAdmin")){
            return signInRef.isMasterAdmin(...a);
        }
        throw "isMasterAdminFunction is not defined on AuthProvider. set IsMasterAdmin callback on AuthProvider";
    }
  },
  get upsertUser(){
    return function(...a){
        if(this.hasMethod("upsertUser")){
            return signInRef.upsertUser(...a);
        }
        throw "upsertUser function is not defined on AuthProvider. set IsMasterAdmin callback on AuthProvider";
    }
  },
  get getUserProp(){
    return function(...a){
        if(this.hasMethod("getUserProp")){
            return signInRef.getUserProp(...a);
        }
        return null;
    }
  },
  get signIn(){
     return function(...p){
        if(this.hasMethod("signIn")){
            return signInRef.signIn(...p); 
         }
     }
  },
  /***** recupère le nom de la resource table data à partir de la tableName passée en paramètre 
    @param {string} tableName, le nom de la table,
    @return {string}, le nom de la resource obtenue à partir de la table
  */
  get tableDataPermResourcePrefix(){
      return function(tableName,...rest){
        if(this.hasMethod("getTableDataPermResourcePrefix")){
            return defaultStr(this.getTableDataPermResource(tableName,...rest));
        }
        return tableName.trim().toLowerCase();
      }
  },
  get structDataPermResourcePrefix(){
    return function(tableName,...rest){
      if(this.hasMethod("getStructDataPermResourcePrefix")){
          return defaultStr(this.getTableDataPermResource(tableName,...rest));
      }
      return tableName.trim().toLowerCase();
    }
  },
  get signOut(){
    return function(...p){
       if(this.hasMethod("signOut")){
           return signInRef.signOut(...p); 
        }
    }
  },
  /**** permet de définir les références vers les fonctions de déconnexion et de connexion à l'application*/
  get setRef (){
    return (currentSigninRef)=>{
      extendObj(signInRef,currentSigninRef);
      return signInRef;
    }
  },
  get getRef(){
    return ()=> signInRef;
  }
}