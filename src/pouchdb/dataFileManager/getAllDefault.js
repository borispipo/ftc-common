import prepareFilter from "./prepareFilter";
import defaultDataFiles from "./defaultDataFiles";
import isValidDataFile from "./isValidDataFile";
export default function getAllDefault (filter,returnArray){
    filter = prepareFilter(filter);
    let allDBToReturn = returnArray ? [] : {};
    Object.map(defaultDataFiles,(dF,i)=>{
        if(!isValidDataFile(dF,i)) return null;
        if(filter(dF,dF.code,allDBToReturn) !== false){
           if(returnArray){
             allDBToReturn.push(dF);
           } else {
             allDBToReturn[dF.code]=dF
           }    
        }
    });
    return allDBToReturn;
}