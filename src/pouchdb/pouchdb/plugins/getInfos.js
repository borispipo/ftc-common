import DATA_FILES from "../../dataFileManager/DATA_FILES";
import isValidDataFile from "../../dataFileManager/isValidDataFile";
import sanitizeDBName from "../../utils/sanitizeDBName";
import {extendObj,defaultStr,defaultObj,isObj} from "$cutils";
import isDataFileDBName from "../../dataFileManager/isDataFileDBName";

export default function getInfos(){
    const db = this;
    const handleFetchResult = (dataFiles)=>{
        for(let code in dataFiles){
            const dF = dataFiles[code];
            if(!isValidDataFile(dF)) continue;
            if(sanitizeDBName(dF.code) === sanitizeDBName(defaultStr(db.getName(),db.infos?.realName))){
                if(!isObj(db.infos)){
                    db.infos = {};
                }
                extendObj(db.infos,dF,{realName:db.infos?.realName,name:dF.code,type:dF.type});
                return db.infos;
            }
        }
        return extendObj({},db.infos);
    }
    const infos = defaultObj(infos);
    const isDataFile = infos.isDataFileManager || isDataFileDBName(this.getName()) || isDataFileDBName(infos.name)
    if(!isDataFile && typeof window !='undefined' && window && typeof window.fetchPouchdbDataFiles ==='function'){
        return new Promise((resolve,reject)=>{
            fetchPouchdbDataFiles().then((dataFiles)=>{
                return resolve(handleFetchResult(dataFiles));
            }).catch(e=>{
                resolve(handleFetchResult(DATA_FILES.get()))
            });
        })
    }
    return Promise.resolve(handleFetchResult(DATA_FILES.get()));
}