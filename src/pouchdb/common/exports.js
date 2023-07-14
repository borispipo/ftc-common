import CONSTANTS from "../constants";
import appConfig from "$capp/config";
import {defaultObj} from "$cutils";
import {getDB} from "../getDB";
import {isObj,isNonNullString,isFunction,defaultStr,extendObj,defaultArray} from "$cutils";
import getStructDataDB from "../getStructDataDB";

export const DB_NAME = CONSTANTS.COMMON_DB;//le nom de la base de données commune à toutes les applications

export const getDefaultStructsData = ()=>{
    const pouchdbFunc = appConfig.get("pouchdbInitialStructsData");
    if(typeof pouchdbFunc ==='function'){
        return defaultObj(pouchdbFunc());
    }
    return defaultObj(pouchdbFunc);
}

export const COMPANY_ID = CONSTANTS.COMPANY_ID_SETTING;

export const COMPANY_TABLE_NAME = "COMPANY";

export const getStructDataDocIdFromTable = (tableName)=>{
    if(!isNonNullString(tableName)) return null;
    return tableName.toUpperCase().trim();
}

/** récupère une données où l'ensemble des données de structures : 
*  @param : tableName : le nom de la table de de la données de structure
*  @param : code : code de la données particulière dans la liste des données de type tableName
*/
export const getStructData = (tableName,code,options)=>{
    if(isObj(tableName)){
        options = tableName;
        tableName = defaultStr(options.tableName,options.table);
        code = defaultStr(code,options.code);
    }
    options = defaultObj(options);
    tableName = getStructDataDocIdFromTable(tableName);
    const defaultStructData = getDefaultStructsData();
    let allData = {};
    if(tableName){
        Object.map(defaultStructData[tableName],(struct,i)=>{
            allData[i] = struct;
        })
    }
    return new Promise((resolve,reject)=>{
        getStructDataDB().then(({db})=>{
            if(!tableName) {
                allData = {...defaultStructData};
                options.include_docs = true;
                return db.allDocs(options).then((docs)=>{
                    docs.rows.map((data)=>{
                        if(isObj(data) && isObj(data.doc)){
                            if(isNonNullString(data.doc.table)){
                                allData[data.doc.table] = data.doc;
                            }
                        }
                    });
                    docs.allData = allData;
                    resolve(docs)
                }).catch((e)=>{
                    console.log(e,"gettings struct data without table name");
                    resolve({allData})
                    return e;
                });
            }
            const _id = getStructDataDocIdFromTable(tableName);
            const success = (doc)=>{
                let data = allData;
                if(isNonNullString(code)){
                    code = code.trim();
                    data = defaultVal(data[code],data[code.toUpperCase()]);
                }
                resolve({allData,data,doc})
            }
            db.get(_id).then((doc)=>{
                for(let i in doc){
                    if(isObj(doc[i])){
                        allData[i] = doc[i];
                    }
                }
                success(doc);
            }).catch((e)=>{
                if(e && e.status != 404){
                    console.log(e,' getting struct data for table=',tableName," code : ",code)
                }
                success(null);
            });
        }).catch((e)=>{
            console.log(e,' getting struct data db');
            reject({status:false,error:'Impossible de récupérer la base des données de structures'})
        });
    });
}

/**** toutes les promesses sont résolues en passant en paramètre un tableau 
    contenant : 
        - en premier arg : la données ayant subit la modification
        - en deuxième arg : toutes les données communes
        - en troisième l'objet status du résultat, retournée par la fonction upsert du plugin pouchdb upsert
 */
/** met à jour une données où l'ensemble des données de structures : 
    *  @param : tableName : le nom de la table de de la données de structure
    *  @param : code : code de la données particulière dans la liste des données de type tableName
*/
export const upsertStructData = (tableName,data,diffFunction)=>{
    if(!isNonNullString(tableName)){
        return Promise.reject({status:false,msg:'Impossible de faire un update de la données de structure car la table est invalide'})
    }
    if(isFunction(data)){
        diffFunction = data;
    }
    tableName = getStructDataDocIdFromTable(tableName);
    data = defaultObj(data);
    const defaultCode = data.isDefault? data.code : undefined;
    return new Promise((resolve,reject)=>{
        getStructDataDB().then(({db})=>{
            db.upsert(tableName,(allData)=>{
                if(isNonNullString(data.code)){
                    data = allData[data.code] = extendObj({},allData[data.code],data);
                    delete allData[data.code].isDefault;
                    if(defaultCode){
                        allData.default = data.code;
                    }
                }
                allData.table = tableName;
                if(isFunction(diffFunction)){
                    allData = diffFunction(allData);
                }
                return allData;
            }).then((nD)=>{
                resolve({...nD,allData:nD.newDoc,data});
            }).catch((e)=>{
                console.log(e,' upserting struct data');
                reject(e);
            }).catch((e)=>{
                console.log(e,' getting struct data db for upsert');
                reject(e);
            });
        })
    })
}
/** supprime une données où l'ensemble des données de structures : 
    *  @param : tableName : le nom de la table de de la données de structure
    *  @param : code : code de la données particulière dans la liste des données de type tableName
*/
export const removeStructData = (tableName,code)=>{
    let data = isNonNullString(code)? {code}: code;
    data = defaultObj(data);
    let deleted = undefined;
    return  upsertStructData(tableName,data,(allData)=>{
        deleted  = allData[data.code];
        delete allData[data.code];
        return allData;
    }).then((args)=>{
        args.deleted = deleted;
        return args;
    }).catch((e)=>{
        console.log(e,' remvoe struct data');
        return e;
    })
}

export const getCompany = (code)=>{
    return new Promise((resolve,reject)=>{
        const err = (e)=>{
            console.log(e,' getting company');
            resolve(isNonNullString(code)? undefined : {});
        }
        const success = (data)=>{
            data = defaultObj(data);
            if(isNonNullString(code)){
                resolve(data[code]);
            } else {
                resolve(data);
            }
        }
        getDB(DB_NAME).then(({db})=>{
            db.get(COMPANY_ID).then((data)=>{
                success(data);
            }).catch(err);
        }).catch(err);
    })
};

/*** @param {object|func:upsert diffFonction} : la données à enregistrer
*   @parm {func:upsert diffFunc} : la fonction permettant de modifier la données via la méthode upsert
*/
export const setCompany = (settingData,diffFunction)=>{
    if(isFunction(settingData)){
        diffFunction = settingData;
    }
    settingData = defaultObj(settingData);
    return getDB(DB_NAME).then(({db})=>{
        return db.upsert(COMPANY_ID,(newDoc)=>{
            let r = {...newDoc,...settingData,table:COMPANY_TABLE_NAME}
            if(isFunction(diffFunction)){
                r = diffFunction(r);
            }
            return r;
        }).then((up)=>{
            return up.newDoc;
        });
    });
};

/*** supprime de la company
* @param {string|func}
* - si chaine de caractère alors la prop code sera supprimée de company
* - si fonction alors il s'agira de la fonction à appeler pour la diffFunction
* @param {func} - la diffFunction
*/
export const removeCompany = (code,diffFunction)=>{
    if(isFunction(code)){
        diffFunction = code;
    }
    return getDB(DB_NAME).then(({db})=>{
        return db.upsert(COMPANY_ID,(newDoc)=>{
            if(isNonNullString(code)){
                delete newDoc[code];
            }
            if(isFunction(diffFunction)){
                newDoc = diffFunction(newDoc);
            }
            return newDoc;
        }).then((up)=>{
            return up.newDoc;
        });;
    });
};