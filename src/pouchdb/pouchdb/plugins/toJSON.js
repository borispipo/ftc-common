/**** permet d'exporter la base dans un format JSON :
 *    si options est un objet et options.selector est un objet, alors les données seront récupérées à l'aide du 
 *      plugin pouchdb-find de pouchdb, voir https://pouchdb.com/guides/mango-queries.html
 *    sinon, alors, toutes les données de la base seront exportées
 */
import formatJSON from "../../exporter/formatJSON";
import {isObj,defaultObj,} from "$cutils";
export default function toJSONPouchdbPlugin (success,error,options){
    return new Promise((resolve,reject)=>{
        if(isObj(success)){
            let t = options;
            options = success;
            if(isFunction(error)){
                success = error;
                if(isFunction(t)){
                    error = t;
                } else error = undefined;
            }
        }
        options = defaultObj(options);
        let {validate} = options;
        success = isFunction(success)? success : isFunction(options.success)? options.success:undefined;
        error = isFunction(error)? error : isFunction(options.error)? options.error : undefined;
        let format = options.format;
        let db = this;
        let formatCB = (docs)=>{
            let sF = (dsc)=>{
                dsc = defaultVal(dsc,docs)
                let arg = {json:JSON.stringify(dsc),docs:dsc};
                if(isFunction(success)){
                    success(arg);
                } else {
                    resolve(arg);
                }
            }
            if(format) {
                formatJSON({format,validate,docs,dbName:db.getName()}).then(sF)
            } else {
                sF(docs);
            }
        }
        /*** si les données sont récupérées à l'aide du plugin pouchd-find */
        if(isObj(options.selector)){
            //console.log("infding")
            this.find(options).then(formatCB).catch((e)=>{
                if(isFunction(error)){
                    error(e);
                } else reject(e);
            });
            return;
        }
        this.allDocs({include_docs: true, attachments: true,...options}).then((docs)=>{
            formatCB(docs.rows);
        }).catch((e)=>{
            if(isFunction(error)){
                error(e);
            } else {
                reject(e);
            }
        })
    });
}