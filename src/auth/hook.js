import React from "$react";
import APP from "$capp/instance";


export const AuthContext = React.createContext(null);

export function useAuth() {
    return React.useContext(AuthContext);
}


export const useIsSignedIn = ()=>{
  const [isSignIn,setIsSignIn] = React.useState(isSignedIn());
  React.useEffect(()=>{
    const onSignInOrOut = ()=>{
      setIsSignIn(isSignedIn());
    }
    APP.on(APP.EVENTS.AUTH_LOGIN_USER,onSignInOrOut);
    APP.on(APP.EVENTS.AUTH_LOGOUT_USER,onSignInOrOut);
    return ()=>{
      APP.off(APP.EVENTS.AUTH_LOGIN_USER,onSignInOrOut);
      APP.off(APP.EVENTS.AUTH_LOGOUT_USER,onSignInOrOut);
    }
  },[])
  return React.useMemo(()=>isSignIn,[isSignIn]);
}
export const useIsLoggedIn = useIsSignedIn;