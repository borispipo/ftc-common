import Auth from "./instance";
import Provider from "./AuthProvider";
import Container from "./Container";

export * from "./AuthProvider";
export * from "./instance";

export {default as Container} from "./Container";

export {default as AuthProvider} from "./AuthProvider";

Auth.Container = Container;
Auth.Provider = Provider;

if(typeof window !='undefined' && window){
    if(!window.___hasDefinedAuthModuleMS){
        Object.defineProperties(window,{
            Auth : {value:Auth,writable:false,override:false}
        });
        window.___hasDefinedAuthModuleMS = true;
    }
}

export default Auth;
