import {isElectron} from "$cplatform";
import electronStorage from "./index.electron";
const hasLocalStorage = typeof window !='undefined' && window && window.localStorage && window.localStorage.getItem && window.localStorage.setItem;
const storage = isElectron()? electronStorage : (hasLocalStorage ? require("./localstorage") : require("./cookies")).default;
export const get = storage ? storage.get : x=> undefined;
export const set = storage ? storage.set : x=> Promise.reject({});
export default storage ? storage : {get,set};