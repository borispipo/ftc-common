import {isJSON, parseJSON,stringify} from "$cutils/json"

export const handleSetValue = (value,decycle) => {
  value = value && typeof value =="object" ? stringify(value,decycle) : value;
  if(value ===null) value = "";
  return value;
}
export const handleGetValue = value => {
  if(value !== null) {
    return isJSON(value) ? parseJSON(value) : value;
  }
  return undefined;
}
 

export default {handleGetValue,handleSetValue};