import config from "$capp/config";

export default {
    //le prefix des noms de bases de données, toutes les bases sont préfixées par celà
    get DB_NAME_PREFIX() {
        return config.pouchdbNamePrefix;
    }, 
    //le nom de la base de données communes,
    get COMMON_DB (){
        return "COMMON_DB";
    },
    //l'id des paramètres communs à toutes les bd de l'application
    get SETTINGS (){
        return 'SETTINGS_DBS_ID';
    }, 
    //l'id des paramètres de la société dans
    get COMPANY_ID_SETTING (){
        return 'DB_COMPANY_ID_SETTINGS';
    }, 
    get PIECES_TABLE_ID (){
        return 'DB_PIECES_IDS';//l'id de la table des numéros de 
    }
}