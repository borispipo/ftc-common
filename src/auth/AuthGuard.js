// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { useAuth } from "./AuthProvider"
import React from "$react";

export default function AuthGuard({ children,...rest}) {
  const auth = useAuth();
  const { user } = auth;
  const forceRender = React.useForceRender();
  if (isObj(user) && auth.isLoggedIn()){
    const child = typeof children =='function' ? children(auth) : children;
    return React.isValidElement(child)? child : null;
  }
  return <AuthGuard.Login
    {...rest}
    withPortal onSuccess = {forceRender}
  />
}

///on peut override cette fonction, pour le rendu de la méthode login
AuthGuard.Login = ()=>null;