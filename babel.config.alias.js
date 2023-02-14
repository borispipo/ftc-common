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
 *      base : {string}, le chemin racine du projet
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
    const packagePath = path.resolve(process.cwd(),"package.json");
    const configPath = path.resolve(common,"app","config.json");
    if(fs.existsSync(packagePath)){
        try {
            const packageObj = require(`${packagePath}`);
            if(packageObj){
                ["scripts","private","main","repository","keywords","bugs","dependencies","devDependencies"].map(v=>{
                    delete packageObj[v];
                })
                fs.writeFileSync(configPath,JSON.stringify(packageObj,null,"\t"));
            }
        } catch{}
    }
    let {base,withPouchdb,withPouchDB,assets,alias,platform} = opts && typeof opts =="object"? opts : {};
    platform = getPlatform(platform);
    withPouchDB = withPouchDB || withPouchdb;
    base = base? base : process.cwd();;
    const src = path.resolve(base,"src");
    const pouchdbIndex = path.resolve(common,"pouchdb",withPouchDB?"index.with-pouchdb":"index.with-no-pouchdb");
    const $packageJSON = fs.existsSync(configPath) && configPath || path.resolve(common,"app","config.default.json");
    const r = {
        "$cmedia" : path.resolve(common,"media"),
        $packageJSON,
        "$package.json" : $packageJSON,
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
        "$cpouchdbIndex" : path.resolve(common,"pouchdb","pouchdb","plugins","defaultIndex"),
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
        "$base" :base, 
        "$src" : src,
        
        "$datafileManager" : path.resolve(common,"pouchdb","dataFileManager"),
        ...(typeof alias =='object' && !Array.isArray(alias) && alias || {}),
        "$ftc-common":"@fto-consult/common",
        "$ftc-expo":"@fto-consulting/expo-ui",
        "$ftc" : "@fto-consult",
        "$cloginComponent":path.resolve(common,"auth","LoginComponent"),
        "$cgetLoginProps" : path.resolve(common,"auth","getLoginProps"),
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
    r["$csignIn2SignOut"] = path.resolve(common,"auth","signIn2SignOut");
    /**** cet alias var servir à personnaliser les fonction de connexion signIn et de déconnexion signOut à l'application */
    if(!r["$signIn2SignOut"]){
        r["$signIn2SignOut"] = r["$csignIn2SignOut"];
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
    if(!r["$loginComponent"]){
        r["$loginComponent"] = r["$cloginComponent"];
    }
    if(!r["$auth"]){
        r["$auth"] = r["$cauth"];
    }
    /*** les indixes des bases de données pouchdb qui doivent automatiquement crée par l'application 
     * doit systématiquement exporté un objet portant pour chacune des base de données, les différents index à créer
    */
    if(!r["$pouchdbIndex"]){
        r["$pouchdbIndex"] = r["$cpouchdbIndex"];
    }
    /****
     * permettant de récupérer les props à passer au composant FormData, du composant LoginComponent pour la connexion de l'utilisateur
     */
    if(!r["$getLoginProps"]){
        r["$getLoginProps"] = r["$cgetLoginProps"];
    }
    r.$apiCustom = r.$apiCustom || r.$capiCustom;
    r.$print = r.$print || r["$cprint"];
    return r;
}