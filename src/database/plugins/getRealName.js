export default function getRealPouchdbName(){
    let dbName = defaultStr(this.getName()).toLowerCase();
    return defaultStr(dbName).toLowerCase();
}