import Platform from "./device";
import { isReactNative } from "$active-platform";
const Neu = require("$cneutralino");
const ios = 'ios',android = 'android', web = 'web',electron = 'electron';
const pf = Platform.platform;

export const isPureWeb = x=> pf ===web ? true : false;

export const isIos = x=> pf === ios ? true : false;

export const isAndroid =  x=> pf ===android ? true : false;

export const isNativeMobile = x=> isAndroid() || isIos();

export const isMobileNative = isNativeMobile;

export {isReactNative};

export const isReactNativeWebview = ()=>{
  if(!isClientSide() || ! window?.ReactNativeWebView || typeof window?.ReactNativeWebView?.postMessage !=="function") return false;
  return true;
}

export const isRNWebview = isReactNativeWebview;

export const isElectron = function() {
  if(pf ==='electron') return true;
  if(typeof window !=="undefined" && window){
      if(typeof window.isElectron =="function"){
          return window.isElectron();
      }
      if(typeof window.isElectron =='boolean' && window.isElectron){
          return true;
      }
      if(typeof window.process === 'object' && window.process.type === 'renderer') {
          return true;
      }
  }
  // Main process
  if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
      return true;
  }
  // Detect the user agent when the `nodeIntegration` option is set to true
  if (typeof navigator === 'object' && navigator && typeof navigator.userAgent === 'string' && (typeof (navigator.userAgent) =="string"? (navigator.userAgent):"").toLowerCase().indexOf('electron') >= 0) {
      return true;
  }
  return false;
}

export const isNeutralino = function(){
  if(typeof window =='undefined' || !window || typeof navigator ==='undefined' || !navigator) return false;
  if(window && !window?.Neutralino){
    window.Neutralino = Neu;
  }
  if(typeof window?.Neutralino ==="object" && Neutralino){
    if(Neutralino?.app && typeof Neutralino?.app =="function") return true;
    if(Neutralino?.events && Neutralino?.app) return true;
    if(Neutralino?.events && typeof Neutralino?.events?.on =="function") return true;
    if(Neutralino?.os && typeof Neutralino?.os?.getEnvs =="function") return true;
  }
  if(isNonNullString(window?.NL_APPID) && window?.NL_APPID.toLowerCase().includes("neutralino")) return true;
  if(isNonNullString(window?.NL_CVERSION) && isNonNullString(window?.NL_CWD) && isNonNullString(window?.NL_MODE) && isNonNullString(window?.NL_OS)) return true;
  if(typeof navigator === 'object' && navigator && typeof navigator?.userAgent === 'string'){
    if(navigator.userAgent?.toLowerCase().includes('neutralino')) return true;
    if(navigator?.userAgent.toLowerCase().includes("@fto-consult/neut")) return true;
  }
  return false;
}

export const isWeb = (onlyPureWeb)=>{
    if(isMobileNative()) return false;
    return  onlyPureWeb ===true ? !isElectron() : isClientSide(); 
}

/**** si l'environnement est en mode dévelooppement ou pas */
export const isDev = x=> typeof __DEV__ !=='undefined' ? __DEV__ : isNode() && process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath) ? true : false;

export const isDevMode = isDev;

export const isDevEnv = isDev;

export const isProductionEnv = x=> !isDev();

/***browser is on a mobile device*/
export const isMobileBrowser = x=> isWeb() && typeof navigator !=='object' && navigator && typeof navigator.userAgent=='string' && (/android|webos|iphone|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase())) ? true : false;

export const isAndroidMobileBrowser = x=> isWeb() && typeof navigator !=='object' && navigator && typeof navigator.userAgent=='string' && (/android/i.test(navigator.userAgent.toLowerCase())) ? true : false;

export const isWebOrElectron = x=> isWeb() || isElectron();

export const isServerSide = x => typeof window === 'undefined' && typeof process !=='undefined' || !window || typeof window !=='object' ? true : false;

export const isClientSide = x=> typeof window =="undefined"? false : typeof window !=="undefined" && typeof window === "object" ? true : false;

export const isExpo = isReactNative;

export const isNextJS = isClientSide() && window.next?.version?true :  (typeof process !='undefined' && process && process.browser);


export const canTextBeSelectable = x => !isMobileNative() && !isTouchDevice()?true : false;

export const isNativeDesktop = x=>isElectron() || isNeutralino();

 /**
   * @property isNode
   * @type boolean
   *
   * Indicates whether executes in node.js application.
   */
export const isNode = x=> {
  try {
    
    if(typeof process !== 'undefined' && process?.versions && process?.versions?.node){
        return true;
    }
    if(typeof global === 'object' && '[object global]' === global?.toString.call(global)) return true;
  } catch{}
  return false;
}
export const isNodeJS = isNode;

// http://stackoverflow.com/questions/19877924/what-is-the-list-of-possible-values-for-navigator-platform-as-of-today
const pfstring = typeof window !=='undefined' && window && window.navigator && typeof window.navigator.platform =='string' && window.navigator.platform ? window.navigator.platform : "";

export const isDarwin = isNode() && process.platform === 'darwin'? true : pfstring.substring(0, 3) === 'Mac'? true : false;

export const isWin32 = x => isNode() && process.platform === 'win32' ? true : pfstring.substring(0, 3) === 'Win' ? true : false;


export const isTouchDevice = function () {
    if(typeof document != 'undefined' && document){
        try {
            document.createEvent("TouchEvent");
            return true;
          } catch (e) {
              return 'ontouchstart' in window        // works on most browsers 
              || 'onmsgesturechange' in window;  // works on IE10 with some false positives
          }
    }
    return false;
}

export const isCapacitor = function(){
    return false;
}

export const isIE = function() {
    if(typeof window =="undefined" || !window) return false;
    if(!window.navigator || !isNonNullString(window.navigator.userAgent)) return false;
    const ua = window.navigator.userAgent.toLowerCase();
    var msie = ua.indexOf('msie ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }
    var trident = ua.indexOf('trident/');
    if (trident > 0) {
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }
    var edge = ua.indexOf('edge/');
    if (edge > 0) {
        // Edge (IE 12+) => return version number
        return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }
    // other browser
    return false;
}

export const isChromeBrowser = ()=>{
    if(typeof navigator =='undefined' || !navigator) return false;
    return /chrome/i.test(navigator.userAgent)? true : false;
}

  const GOOGLE_VENDOR_NAME = 'Google Inc.';
  
  export function getBrowserName() {
    if(!window.navigator || !window.navigator.userAgent) return "Unknown";
    const userAgent = window.navigator.userAgent;
    const vendor = window.navigator.vendor;
    switch (true) {
      case /Edge|Edg|EdgiOS/.test(userAgent):
        return 'Edge';
      case /OPR|Opera/.test(userAgent) && isOpera():
        return 'Opera';
      case /CriOS/.test(userAgent):
      case /Chrome/.test(userAgent) && vendor === GOOGLE_VENDOR_NAME :
        return 'Chrome';
      case /Vivaldi/.test(userAgent):
        return 'Vivaldi';
      case /YaBrowser/.test(userAgent):
        return 'Yandex';
      case /Firefox|FxiOS/.test(userAgent):
        return 'Firefox';
      case /Safari/.test(userAgent):
        return 'Safari';
      case /MSIE|Trident/.test(userAgent):
        return 'Internet Explorer';
      default:
        return 'Unknown';
    }
  }