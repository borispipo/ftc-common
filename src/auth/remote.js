import {logout,setToken,isLoggedIn} from "./utils";
import login from "./utils/login";
import {post} from "$capi";
import {SIGN_IN} from "$cauth/routes";
import {navigate} from "$cnavigation/utils";
import notify from "$active-platform/notify";
import i18n from "$ci18n";
import {SIGNIN_API_PATH,SIGNOUT_API_PATH,} from "./routes";

export const isSignedIn = isLoggedIn;

/***** persist new user into session */
export const signIn = (user,callback)=>{
  return post({
      isAuth : true,
      json : true,
      url : SIGNIN_API_PATH,
      body : user
  }).then(({response,userId,token,...rest})=>{
    if(response.success){
      delete user.password;
      user.id = defaultStr(userId,user.id,user.code,user.email);
      user.token = token;
      user.code = defaultStr(user.code,user.email);
      setToken({userId,token});
      delete user.password;
      delete user.pass;
      login(user,true);
      if(typeof callback ==='function'){
          callback(user);
      }
    }
    return {response,userId,token,...rest};
  }).catch((e)=>{
      console.log(e," unable to signIn user")
      notify.error({...defaultObj(e),position:'top'});
      logout();
      throw e;
  })
}

/**** signOut current user */
export const signOut = (callback)=>{
  const cb = ()=>{
    logout(null);
    setToken(null);
    if(typeof callback =='function'){
       callback();
    }
    if(callback === false) return;
    notify.success(i18n.lang("you_are_successfull_logged_out"))
  }
  return post({
      url : SIGNOUT_API_PATH
  }).catch((e)=>{
    return e;
  }).finally(cb);
}

/*** déconnecte l'utilisateur et le redirige vers la page voulue redirectStr
 * @param {string|boolean} redirectStr : l'url de redirection une fois déconecté l'utilisateur
 * @param {boolean|string} si un message de notification sera envoyée
 */
 export const signOut2Redirect = (redirectStr,notifyUser)=>{
    if(typeof redirectStr ==='boolean'){
      notifyUser = redirectStr;
    }
    const notifyMessage = typeof notifyUser ==='string'? notifyUser : undefined;
    notifyUser = typeof notifyUser =='boolean'? notifyUser : true;
  
    redirectStr = typeof redirectStr =="string"? redirectStr : SIGN_IN;
    return signOut(false).then(()=>{
       navigate(redirectStr);
       if(notifyUser){
          notify.warning(defaultStr(notifyMessage,i18n.lang("you_have_been_redirected_to_homepage")));
       }
       return redirectStr;
    });
  }
  export const upsertUser = (u)=> {
     if(isObj(u) && isNonNullString(u.email)){
       login(u);
     }
     return Promise.resolve(u);
  };