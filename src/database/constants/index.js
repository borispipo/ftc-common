import config from "$capp/config";

export default {
    DB_NAME_PREFIX : config.pouchdbNamePrefix , //com.ms.apps.slite//le prefix des noms de bases de données, toutes les bases sont préfixées par celà
    COMMON_DB : "COMMON_DB",//le nom de la base de données communes,
    SETTINGS : 'SETTINGS_DBS_ID', //l'id des paramètres communs à toutes les bd de l'application
}