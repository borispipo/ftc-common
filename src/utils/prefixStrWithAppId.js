import "./extend.prototypes";
const config = require("$app/config");
export default function prefixStrWithAppId (text,sep){
    const appId = config.id;
    if(typeof text !=="string") return appId;
    sep = typeof sep =="string"? sep : "-";
    let r = appId+sep;
    return r+text.ltrim(r); 
}