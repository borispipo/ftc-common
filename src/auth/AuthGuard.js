// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { useAuth } from "./AuthProvider"
import React from "$react";
import appConfig from "$capp/config";

export default function AuthGuard({ children,...rest}) {
  const auth = useAuth();
  const { user } = auth;
  console.log(user,"is user111 ",auth);
  const forceRender = React.useForceRender();
  if (isObj(user) && auth.isLoggedIn()){
    const child = typeof children =='function' ? children(auth) : children;
    return React.isValidElement(child)? child : null;
  }
  const LoginComponent = React.isComponent(appConfig.LoginComponent)? appConfig.LoginComponent : null;
  if(!LoginComponent){
    throw "Login component not defined!!! Merci de définir le composant de connextion à traver la propriété LoginComponent de $appConfig";
    return null;
  }
  return <LoginComponent
    {...rest}
    withPortal onSuccess = {forceRender}
  />
}