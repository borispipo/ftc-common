// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

export const signInRef = {
    current : {},
};
/**** SignIn2Signout est étendue avec le composant AuthProvider*/
export default {
  get hasMethod(){
    return function(methodName){
        return typeof signInRef.current[methodName] === "function";
    }
  },
  get isMasterAdmin(){
    return function(...a){
        if(this.hasMethod("isMasterAdmin")){
            return signInRef.current.isMasterAdmin(...a);
        }
        throw "isMasterAdminFunction is not defined on AuthProvider. set IsMasterAdmin callback on AuthProvider";
    }
  },
  get upsertUser(){
    return function(...a){
        if(this.hasMethod("upsertUser")){
            return signInRef.current.upsertUser(...a);
        }
        throw "upsertUser function is not defined on AuthProvider. set IsMasterAdmin callback on AuthProvider";
    }
  },
  get getUserProp(){
    return function(...a){
        if(this.hasMethod("getUserProp")){
            return signInRef.current.getUserProp(...a);
        }
        return null;
    }
  },
  get signIn(){
     return function(...p){
        if(this.hasMethod("signIn")){
            return signInRef.current.signIn(...p); 
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
            return this.getTableDataPermResource(tableName,...rest);
        }
        return tableName.trim().toLowerCase();
      }
  },
  get structDataPermResourcePrefix(){
    return function(tableName,...rest){
      if(this.hasMethod("getStructDataPermResourcePrefix")){
          return this.getTableDataPermResource(tableName,...rest);
      }
      return tableName.trim().toLowerCase();
    }
  },
  get signOut(){
    return function(...p){
       if(this.hasMethod("signOut")){
           return signInRef.current.signOut(...p); 
        }
    }
 }
}