import {defaultObj,defaultStr,isObj} from "$utils";
import getAllDB from "./dataFileManager/getAllDB";
/*** retourne le liste des données dans un tableau d'objet, récupérée via les bases de données spécifiées
 *  @param object options : {
 *      databases [] La liste des données dans laquelle puiser les données,
 *      dataFilter {function}, la fonction à appliquer sur chaque données récupérée
 *      dataMutator {function}, la fonction permettant de faire une mutation sur les données trouvées en base de données
 *      dataFileFilter {function}, la fonction à appliquer pour limiter les bases de données à récupérer
 *      dataFileType {string}, le type particulier des fichiers de données pour lesquels l'on veut récupérer la base de données
 *      server {string}, l'adresse du serveur où on veut aller chercher les données
 *      fetchOptions {object|function}, les options à appliquer au plugin find de pouchdb
 *      ...fetchOptions, les options à passer à la fonction getData, pour la récupération des dites données
 *       : voir pouchdb-find
 *  }
 * 
 *  @return : objet de la forme : 
 *  {
 *      [dabase-code]//database = nom de la bd, et code == nom du code de la données demandée dans la requête
 *      db1-code1 : {
 *          database {string}, le nom de la bd
 *          countData {number} : le nombre d'éléments dans la base database
 *          //le tableau contenant les différents données se trouvant dans chaque base,
 *          ....data {object}, les données en elles même 
*   *   },
        db1-code2 : {
 *          database {string}, le nom de la bd
 *          countData {number} : le nombre d'éléments dans la base database
 *          //le tableau contenant les différents données se trouvant dans chaque base,
 *          ....data {object}, les données en elles même 
*   *   },
        ....
        dbn-coden : {
 *          database {string}, le nom de la bd
 *          countData {number} : le nombre d'éléments dans la base database
 *          //le tableau contenant les différents données se trouvant dans chaque base,
 *          ....data {object}, les données en elles même 
*   *   },
 *  }
 *  @param {function} dataMutator : La fonction de rappel appelée lors du parcours en boucle de l'ensemble des données
 *      Cette fonction prend en paramètre : 
*       {
            db:L'instance pouchdb associé à la bd
            dbName : Le nom de la bd,
            server : Le nom du serveur,
            data : La données courante
            allData : L'ensemble des données,
            count : Le nombre de donnés trouvée dans la base db, pour la requête
*       }
 */ 
export default function getAllData(options,dataMutator){
    let {dataFileType,dataFilter,dataFileFilter,loop,fetchOptions,...rest} = defaultObj(options);
    dataMutator = typeof dataMutator ==='function'? dataMutator : ({data})=>(data);
    dataFileFilter = typeof dataFileFilter =='function'? dataFileFilter : x=>true;
    dataFilter = typeof dataFilter =='function'? dataFilter : x=> true;
    dataFileType = defaultStr(dataFileType).trim().toLowerCase();
    return new Promise((resolve,reject)=>{
        return getAllDB({...rest,filter : (dF,dFCode)=>{
            const dFType = dF.type.toLowerCase().trim();
            if(dataFileType && dFType !== dataFileType) return false;
            if(dataFileFilter(dF,dFCode) === false) return false;
            return true;
        }}).then((databases)=>{
            const promises = [],results = [];
            for(let i in databases){
                const dbArgs = databases[i];
                if(dbArgs.db.infos?.isDataFileManager) continue;
                const {db} = dbArgs;
                const fOptions = typeof fetchOptions ==='function'? defaultObj(fetchOptions(dbArgs)) : defaultObj(fetchOptions);
                promises.push(db.find(fOptions).then((r)=>{
                    r.docs.map((doc)=>{
                        if(!isObj(doc)) return null;
                        doc.dbId = defaultStr(doc.dbId,db.infos?.name,db.infos?.code);
                        doc = dataMutator({data:doc,allData:results,allFetchedData:r,db,dbName:doc.dbId});
                        if(!isObj(doc)) return null;
                        results.push(doc);
                    })
                    return null;
                }));
                return Promise.all(promises).then(resolve).catch((e)=>{
                    throw e;
                })
            }
        }).catch((e)=>{
            console.log(e,' getting all data');
            reject(e);
        });
    });
}
