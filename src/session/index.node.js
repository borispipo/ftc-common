const {Session,isWritable,getAppDataPath} = require("@fto-consult/node-utils");
const packageJSON = require("$packageJSON");
const isW = isWritable(getAppDataPath());
if(isW){
    module.exports.session = Session({appName:packageJSON.name});
    module.exports.hasSession = true;
} else {
    module.exports = {
        get hasSession(){
            return false;
        },
        get get(){
            return (key)=>{
                return undefined;
            }
        },
        get set (){
            return ()=>{
                return undefined;
            }
        },
        get remove(){
            return x=>x;
        }
    }
}
