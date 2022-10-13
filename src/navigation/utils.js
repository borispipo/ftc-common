import {isObj,isFunction,extendObj,defaultStr,defaultObj,isNonNullString} from "$utils";
import {getURIPathName} from "$utils/uri";
import {isWeb,isClientSide} from "$platform";
import actions from "$cactions/actions";
import { navigationRef } from "$active-platform/navigation";

export * from "$active-platform/navigation";

import * as React from "react";

export const sanitizeName =  function (screenName,screenType){
    return actions(screenName,screenType);
}

const ROUTER_MANAGER = {};

let initialRouteName = "";

let isNavigationReady = false;

export const isReady = x=> isNavigationReady;

export const setIsReady = isReady => isNavigationReady = isReady;

export const setInitialRouteName = (name)=> isNonNullString(name)? initialRouteName = name : undefined;

export const getInitialRouteName = ()=> initialRouteName;

export const DRAWER_NAVIGATOR_NAME = "DRAWER_NAVIGATOR_NAME";


export const activeNavigationRef = React.createRef(null);

export const setActiveNavigation = (navigation)=>{
    activeNavigationRef.current = navigation;
}

export const ROUTES_CALLBACK = {};

export function setActiveRoute (currentRoute){
    currentRoute = isNonNullString(currentRoute)? {name:currentRoute}: defaultObj(currentRoute);
    currentRoute.name = sanitizeName(currentRoute.name);
    ROUTER_MANAGER.currentRoute = currentRoute;
    return currentRoute;
}

export const canUseNavigationRef = x=> isObj(navigationRef) && isFunction(navigationRef.isReady) && navigationRef.isReady();
export const getActiveRoute = x=> {
    if(isObj(ROUTER_MANAGER.currentRoute) && isNonNullString(ROUTER_MANAGER.currentRoute.name)){
        ROUTER_MANAGER.currentRoute.routeName = defaultStr(ROUTER_MANAGER.currentRoute.routeName,ROUTER_MANAGER.currentRoute.name);
        return ROUTER_MANAGER.currentRoute;
    }
    if(canUseNavigationRef() && navigationRef.getCurrentRoute){
        return defaultObj(navigationRef.getCurrentRoute());
    }
    const name = defaultStr(getInitialRouteName());
    return {name,routeName:name};
};


export const goBack = (options,navigation)=>{
    if(typeof options ==='function'){
        options = {onGoBack:options};
    }
    navigation = isValidNavigation(navigation) ? navigation : navigationRef;
    if(typeof navigation.canGoBack ==='function' && navigation.canGoBack()){
        options = defaultObj(options);
        if(typeof options.beforeGoBack =='function' && options.beforeGoBack({...options,beforeGoBack:undefined,goBack:()=> navigation.goBack(null)}) === false) return false;
        navigation.goBack(null);
        if(typeof options.onGoBack ==='function'){
            options.onGoBack();
        } if(typeof options.callback ==='function'){
            options.callback();
        } 
        return true;
    }
    return false;
}

export const EXIT_COUNTER = {
    counter : 0,
    reset : ()=>{
        EXIT_COUNTER.counter = 0;
    },
}

export const isValidNavigation = (navigation)=> isObj(navigation) && isFunction(navigation.navigate) && isFunction(navigation.goBack);

export const useNavigation = ()=> {
    return activeNavigationRef.current && activeNavigationRef.current.setOptions ? activeNavigationRef.current : navigationRef;
};


/*** retourne les options de la route en cours */
export const getRouteOptions = (opts)=>{
    let {route} = defaultObj(opts);
    route = defaultObj(route);
    const routeName = sanitizeName(defaultStr(route.name,route.routeName));
    route.params = {...defaultObj(route.params),...defaultObj(ROUTES_CALLBACK[routeName])};
    route.data = defaultObj(route.data,route.params.data);
    return route;
}

export const getRouteOpts = getRouteOptions;


export const buildScreenRoute = function(tableName,parent){
    if(!isNonNullString(tableName)) return undefined;
    parent = defaultStr(parent);
    if(parent){
        parent= parent.rtrim("/")+"/";
    }
    return sanitizeName(parent+tableName);
}



/*** permet de garder les options de l'écran courant */
let screenOptions = {};

export const setScreenOptions = (options)=>{
    screenOptions = typeof options =='object' && options ? options : {};
    return screenOptions;
}

export const useScreenOptions = ()=>{
    return defaultObj(screenOptions);
}

export const getScreenOptions = useScreenOptions;


export const isRouteActive = (routeName)=>{
    if(isNonNullString(routeName)){
        routeName = {routeName};
    }
    routeName = defaultObj(routeName).routeName;
    let currentRoute = defaultStr(getActiveRoute().name);
    routeName = isObj(routeName)? defaultStr(routeName.routeName,routeName.name) : defaultStr(routeName);
    if(!currentRoute){
        currentRoute = getInitialRouteName();
    }
    return routeName && sanitizeName(routeName) === (currentRoute) ? true : false;
}

export const currentRouteRef = React.createRef(null);

export const setRoute = (route)=>{
    currentRouteRef.current = route;
}

export const useRoute = (route)=>{
    if(currentRouteRef.current) return currentRouteRef.current;
    if(!canUseNavigationRef()) return {};
    return navigationRef.getCurrentRoute();
}
export const getRoute = useRoute;

/**** retourne les props à passer à l'objet tableDataItem
 * @param props {object} les props à passer à l'écran en cours
 * @param table {string ||object}, les options de la table récupérée en base de données
*/
export function getScreenProps(props){
    const {params,data} = getRouteOptions(props);
    return {...params,...props,data:defaultObj(params.data,data,props?.data)};
}

export const navigate = (toRoute,navigation)=>{
    if(!isClientSide()) return;
    if(isNonNullString(toRoute)){
        toRoute = {url:toRoute};
    }
    if(!isObj(toRoute)) return null;
    let {routeName,route,from,url,routeParams,href,params,source,...rest} = toRoute;
    routeName = sanitizeName(defaultStr(url,href,routeName,route));
    params = extendObj({},routeParams,params);
    params = {...defaultObj(rest),...params};
    source = defaultStr(source).toLowerCase();
    const currentNavigation = isValidNavigation(navigation) ? navigation : navigationRef;
    const {navigate} = currentNavigation;
    if(typeof navigate === "function"){
        params = {...defaultObj(rest),...params};
        ROUTES_CALLBACK[routeName] = {};
        ///on persiste les paramètes de la route
        for(let i in params){
            if(typeof params[i] ==='function'){
                ROUTES_CALLBACK[routeName][i] = params[i];
                delete params[i];
            }
        }
        return navigate(routeName,params)
    }
}
export const redirectIfWeb = (pathname,force)=>{
    pathname = getURIPathName(pathname);
    if(isWeb() && typeof window !=="undefined" && window.location){
        let xN = pathname.ltrim("/").rtrim("/").trim();
        let cW = defaultStr(window.location.pathname).ltrim("/").rtrim("/").trim();
        if((xN !== cW) || (force === true) ){
            window.location.pathname = pathname;
        }
        return window.location.pathname;
    }
    return null;
}
export const redirectOnWeb = redirectIfWeb;

export const redirect = redirectIfWeb;


export const getQueryParams = ()=>{
    const router = useRouter()
    return Object.assign({},router.query);
}