const hasLocalStorage = typeof window !='undefined' && window && window.localStorage && window.localStorage.getItem && window.localStorage.setItem;
const storage = (hasLocalStorage ? require("./web/session.localstorage") : require("./web/session.cookies")).default;
export const get = storage.get;
export const set = storage.set;
export default storage;