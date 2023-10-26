const path = require("path");
const fs = require("fs");
const platforms = require("./src/platforms");
const getPlatform = (platform)=>{
    platform = (typeof platform =='string'? platform : "web").toLowerCase();
    for(let i in platforms){
        let pl = platforms[i];
        if(!pl || typeof pl !='string') continue;
        if(pl.toLowerCase() == platform) return platform;
    }
    return "web";
}

/*** 
 * @param {object}, les options du resolver, objet de la forme : 
 * {
 *      projectRoot : {string}, le chemin racine du projet
 *      platform : {web||expo},//La plateforme du client
 *      assets : {string}, le chemin assets de l'application,
 *      alias  : {object}, les alias supplémentaires, pouvant être concaténés à ceux généré
 * }
 * 
*/
module.exports = function(opts){
    /***** faire une copie du fichier package.json, situé à la racine du projet */
    const rootDir = path.resolve(__dirname);
    const common = path.resolve(rootDir,"src");
    let {projectRoot,withPouchdb,withPouchDB,assets,alias,packageJSON:cPackageJSON,platform} = opts && typeof opts =="object"? opts : {};
    platform = getPlatform(platform);
    withPouchDB = withPouchDB || withPouchdb;
    projectRoot = projectRoot && typeof projectRoot =='string' && fs.existsSync(projectRoot) ? projectRoot : process.cwd();;
    const src = path.resolve(projectRoot,"src");
    const packagePath = path.resolve(projectRoot,"package.json");
    const $packageJSON = getPackageJSON([opts.$packageJSON,opts.packageJSON,packagePath,path.resolve(common,"app","config.default.json")]);
    const pouchdbIndex = path.resolve(common,"pouchdb",withPouchDB?"index.with-pouchdb":"index.with-no-pouchdb");
    const cdataFileManager = path.resolve(common,"pouchdb","dataFileManager");
    const r = {
        "$cmedia" : path.resolve(common,"media"),
        $packageJSON,
        "$capp" : path.resolve(common,"app"),
        "$capi" : path.resolve(common,"api"),
        "$capiCustom" : path.resolve(common,"api","apiCustom"),
        "$fetch" : path.resolve(common,"api","fetch"),
        "$ci18n" : path.resolve(common,"i18n"),
        "$clib" : path.resolve(common,"lib"),
        "$cauth":path.resolve(common,"auth"),
        "$cnavigation" : path.resolve(common,"navigation"),
        "$cplatform" : path.resolve(common,"platform"),
        "$cdimensions" : path.resolve(common,"platform/dimensions"),
        "$cobservable" : path.resolve(common,"lib","observable"),
        "$cvalidator" : path.resolve(common,"lib","validator"),
        "$cdate" : path.resolve(common,"lib","date"),
        "$crypto-js" : path.resolve(common,"lib","crypto-js"),
        "$ccountries" : path.resolve(common,"countries"),
        "$cdbMainDatabaseIndex" : pouchdbIndex,
        "$pouchdb" : path.resolve(common,"pouchdb"),
        "$pouchDB" : path.resolve(common,"pouchdb"),
        "$ctheme" : path.resolve(common,"theme"),
        "$cnotify" : path.resolve(common,"notify"),
        "$cutils" : path.resolve(common,"utils"),
        "$curi" : path.resolve(common,"utils","uri"),
        "$ccurrency" : path.resolve(common,"lib","currency"),
        "$csession" : path.resolve(common,"session"),
        "$cbase64" : path.resolve(common,"lib","base-64"),
        "$base64" : path.resolve(common,"lib","base-64"),
        "$cactions" : path.resolve(common,"actions"),
        
        "$media" : path.resolve(common,"media"),
        "$capi" : path.resolve(common,"api"),
        "$i18n" : path.resolve(common,"i18n"),
        "$lib" : path.resolve(common,"lib"),
        "$platform" : path.resolve(common,"platform"),
        "$dimensions" : path.resolve(common,"platform/dimensions"),
        "$observable" : path.resolve(common,"lib","observable"),
        "$validator" : path.resolve(common,"lib","validator"),
        "$crypto" : path.resolve(common,"lib","crypto-js"),
        "$date" : path.resolve(common,"lib","date"),
        "$cdate" : path.resolve(common,"lib","date"),
        "$cfilters" : path.resolve(common,"utils","filters"),
        "$cdatabaseUtils" : path.resolve(common,"utils","database"),
        "$notify" : path.resolve(common,"notify"),
        "$theme" : path.resolve(common,"theme"),
        "$utils" : path.resolve(common,"utils"),
        "$uri" : path.resolve(common,"utils","uri"),
        "$cprint" : path.resolve(common,"print"),
        "$currency" : path.resolve(common,"lib","currency"),
        "$session" : path.resolve(common,"session"),
        "$actions" : path.resolve(common,"actions"),
        "$projectRoot" :projectRoot, 
        "$base" : projectRoot,
        "$src" : src,
        "$cdatafileManager": cdataFileManager,
        "$datafileManager": cdataFileManager,
        ...(typeof alias =='object' && !Array.isArray(alias) && alias || {}),
        "$ftc-common":rootDir,
        "$ftc" : "@fto-consult",
        $cappConfig : path.resolve(common,"app","config"),
        $swr : path.resolve(common,"swr"),
        $useSWR : path.resolve(common,"swr"),
    }
    r.currencies = r.$ccurrency;
    if(!r.$api){
        r.$api = r.$capi;
    }
    if(!r.$appConfig){
        r.$appConfig = r.$cappConfig;
    }
    if(assets){
        r["$assets"] = assets;
        r["$images"] = path.resolve(assets,"images");
        r["$css"] = path.resolve(assets,"css");
    }
    if(!r["$app-events"]){
        r["$app-events"] = path.resolve(common,"app","_events");
    }
    if(!r["$app"]){
        r["$app"] = r["$capp"];
    }
    /*** alias interne utile pour la compilation en fonction de la platform, soi next où expo */
    r["$active-platform"] = path.resolve(common,"platforms",platform);
    r["$clipboard"] = path.resolve(r["$active-platform"],"clipboard");
    r["$makePhoneCall"] = path.resolve(r["$active-platform"],"makePhoneCall");
    r["$common"] = common;
    r["$react"] = path.resolve(common,"utils","react");
    if(!r["$navigation"]){
        r["$navigation"] = r["$cnavigation"];
    }
    /**** cet alias est utile pour la personnalisation du composant de connexion */
    if(!r["$auth"]){
        r["$auth"] = r["$cauth"];
    }
    r.$print = r.$print || r["$cprint"];
    return r;
}

const getPackageJSON = (p)=>{
    if(Array.isArray(p)){
        for(let i in p){
            const r = getPackageJSON(p[i]);
            if(r) return r;
        }
    }
    if(typeof p =='string' && p && fs.existsSync(p) && p.toLowerCase().trim().endsWith(".json")) return p;
    return null;
}