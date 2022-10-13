import APP from "./instance";

export default function initApp(options){
    options = defaultObj(options);
    APP.checkOnline();
    return Promise.resolve({})
}