// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import Auth from "./instance";
import Provider from "./AuthProvider";
import Container from "./Container";
import * as routes from "./routes";

export * from "./AuthProvider";
export * from "./instance";

export {default as Container} from "./Container";

export {default as AuthProvider} from "./AuthProvider";

export {routes};


Auth.Container = Container;
Auth.Provider = Provider;

if(typeof window !='undefined' && typeof window ==='object' && typeof ___hasDefinedAuthModuleMS =='undefined'){
    if(!window.___hasDefinedAuthModuleMS){
        Object.defineProperties(window,{
            Auth : {value:Auth,writable:false,override:false}
        });
        window.___hasDefinedAuthModuleMS = true;
    }
}

export default Auth;
