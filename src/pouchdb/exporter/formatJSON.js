/*** formate les données passés en parmètres au format exportable et directement issus de la bd 
 *  @return {Promise}, objet au format JSON, formaté à l'aide du format passé en paramètre
 * 
 *  Le format JSON exporté est de la forme : 
 *  {
 *      creator : APP.getName(),//le créateur du fichier
        createdBy : Auth.getLoggedUserCode(),
        createdDate : new Date().format(DateLib.SQLDateFormat),
        version : '1.0',
        format,
        dbName, //le nom de la base dans laquelle a été exporté le fichier
        docs : //la liste des lignes issus du fichier
    *  }
    * 
*/
import DateLib from "$date";
import {isNonNullString,isFunction,defaultFunc} from "$cutils";
import {getLoggedUserCode} from "$cauth/utils";
import appConfig from "$capp/config";

export default  (options)=>{
    if(isNonNullString(options)){
        options = {format:options};
    }
    options = defaultObj(options);
    let {docs,validate,type,dbName,success,error,format} = options;
    format = defaultStr(format,'json').toLowerCase();
    validate = defaultFunc(validate,rowData=>rowData)
    return new Promise((resolve,reject)=>{
        if(format === 'json'){
            let data = [];
            if(type == 'struct_data'){
                data = docs;
            } else {
                Object.map(docs,(rowData,i)=>{
                    if(isObj(rowData)){
                        if(isObj(rowData.doc) && isNonNullString(rowData.doc._id)){
                            rowData = rowData.doc;
                        } 
                        if(validate(rowData) === false || (isNonNullString(rowData._id) && rowData._id.toLowerCase().trim().startsWith('_design/'))) return null;
                        data.push(rowData);
                    }
                })
            }
            let r = {
                creator : appConfig.name,
                createdBy : getLoggedUserCode(),
                createdDate : new Date().format(DateLib.SQLDateFormat),
                version : '1.0',
                format,
                type,
                dbName,
                dbId : dbName,
                docs : data
            }
            if(isFunction(success)){
                success(r);
            } else {
                resolve(r);
            }
        } else {
            reject({status:false,message:'type de format invalide pour l\'export des données; format : '+format})
        }
    })
}