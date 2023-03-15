/*** retourne le liste des données dans un tableau d'objet
 *  @param object options : {
 *      databases [] La liste des données dans laquelle puiser les données,
 *      ...fetchDataOpts, les options à passer à la fonction getData, pour la récupération des dites données
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
 *  @param {function} loopCb : La fonction de rappel appelée lors du parcours en boucle de l'ensemble des données
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
import {getDB} from "./getDB";
import {defaultObj} from "$utils";
export default function getAllData(options,loopCb){
    options = defaultObj(options);
    let {databases,server,loop,...fetchDataOpts} = options;
    fetchDataOpts = defaultObj(fetchDataOpts);
    if(isArray(fetchDataOpts.fields) && !arrayValueExists(fetchDataOpts.fields,'code')){
        fetchDataOpts.fields.push("code");
    }
    if(isNonNullString(databases)){
        databases = [databases];
    }
    databases = defaultArray(databases);
    loopCb = defaultFunc(loopCb,loop,({data})=>(data));
    fetchDataOpts.selector = defaultObj(fetchDataOpts.selector);
    let mCode = defaultStr(Auth.masterAdminCode).toUpperCase();
    if(databases.length <= 0){
        return Promise.resolve([]);
    }
    let promises = [];
    let results = [];
    //pour chaque commercial, on met à jour tous les articles y contenant
    for(let i in databases){
        let database = databases[i];
        if(!isNonNullString(database) || database.toUpperCase() == mCode) continue;
        promises.push(
            getDB({dbName:database,server}).then(({db})=>{
                return db.find(fetchDataOpts).then((r)=>{
                    for(let k in r.docs){
                        let d = r.docs[k];
                        if(isObj(d) && (d.code) && typeof d.code == 'string'){        
                            d.dbId = defaultStr(d.dbId,database);
                            d = loopCb({data:d,allData:results,db,dbName:database,database})
                            if(d && typeof d === 'object'){
                                results.push(d);
                            }
                        }
                    }
                    return null;
                });
            })
        )
    }
    return Promise.all(promises).then((r)=>{
        promises = null;
        r = null;
        return results;
    }).catch((e)=>{
        console.log(e,' getting all data');
        return e;
    })
}
