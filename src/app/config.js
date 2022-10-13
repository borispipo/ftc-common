import React from "react";
const configRef = React.createRef();
const getConfig = x=>typeof configRef.current =="object" && configRef.current? configRef.current : {};
const isNonNullString = x=> x && typeof x =='string';
const getValue = function(){
    const conf = getConfig();
    const args = Array.prototype.slice.call(arguments,0);
    let hasKey = false;
    for(let i in args){
        const a = args[i];
        if(isNonNullString(a)){
            hasKey = true;
            if(conf.hasOwnProperty(a)){
                return conf[a];
            }
        }
    }
    return hasKey ? undefined : conf;
}
const config = {
    get current(){
        return getConfig();
    },
    set current(currentConfig){
        configRef.current = currentConfig;
    },
    get name (){
        return getValue("name");
    },
    get description (){
        return getValue("description","desc");
    },
    get version (){
        return getValue("version");
    },
    get env (){
        return getValue("env");
    },
    get realeaseDateStr (){
        return getValue("realeaseDateStr");
    },
    get releaseDate (){
        return getValue("releaseDate");
    },
    get devMail (){
        return getValue("devMail");
    },
    get devWebsite(){
        return getValue("devWebsite");
    },
    get copyRight (){
        return getValue("copyRight");
    },
    get author(){
        return getValue("author");
    },
    //l'unique id de l'application
    get id (){
        return getValue("id");
    },
    get appId (){
        return getValue("appId");
    },
    get apiVersion(){
        return getValue("apiVersion");
    }
}