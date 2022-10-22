import actions from "$cactions";
import APP from "$capp/instance";
export const sanitizeTableName = (tableName)=>{
    if(!isNonNullString(tableName)) return "";
    return tableName.toUpperCase().trim();
}

///les tables vérouillées en cas de modification
export const LOCKED_TABLES = {};

/**** vérouille la table de base de données dont le nom est passé en paramètre 
 * @param tableName {string}, le nom de la table passée en paramètre
*/
export const lockTable = (tableName)=>{
    if(isArray(tableName)){
        let ret = false;
        tableName.map((tb)=>{
            const t = sanitizeTableName(tb);
            if(t){
                LOCKED_TABLES[t] = true;
            }
            ret = true;
        })
        return ret;
    }
    tableName = sanitizeTableName(tableName);
    if(tableName){
        LOCKED_TABLES[tableName] = true;
        return true;
    }
    return false;
}
/*** Dévérouille la table où l'ensemble des tables passées en paramètres
 * @param {array|string} le nom de la table 
 * @param {bool} trigger si le trigger de mise à jour sera appélé une fois la table dévérouillée */
export const unlockTable = (tableName,trigger)=>{
    if(isArray(tableName)){
        let ret = false;
        tableName.map((tb)=>{
            const t = sanitizeTableName(tb);
            if(t){
                delete LOCKED_TABLES[t];
                ret = true;
            }
            if(trigger){
                APP.trigger(actions.upsert(tb),{tableName:tb,table:tb});
            }
        })
        return ret;
    }
    const tb = sanitizeTableName(tableName);
    if(tb){
        delete LOCKED_TABLES[tb];
        if(trigger){
            APP.trigger(actions.upsert(tableName),{table:tableName,tableName});
        }
        return true;
    }
    return false;
}

/*** si la table passé en paramètre est vérouillée 
 * @param tableName {string}
*/
export const isTableLocked = (tableName)=>{
    tableName = sanitizeTableName(tableName);
    return tableName && LOCKED_TABLES[tableName] == true ? true : false;
}
