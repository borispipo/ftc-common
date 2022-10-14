const path = require("path");
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
 *      assets : {string}, le chemin assets de l'application 
 * }
 * 
*/
module.exports = function(opts){
    let {base,assets,platform} = opts && typeof opts =="object"? opts : {};
    platform = getPlatform(platform);
    const rootDir = path.resolve(__dirname);
    const common = path.resolve(rootDir,"src");
    base = base? base : path.resolve(__dirname,"..");
    const src = path.resolve(base,"src");
    const database = path.resolve(src,"database");
    const r = {
        "$react" : path.resolve(common,"utils","react"),
        "$cmedia" : path.resolve(common,"media"),
        "$capp" : path.resolve(common,"app"),
        "$capi" : path.resolve(common,"api"),
        "$ci18n" : path.resolve(common,"i18n"),
        "$clib" : path.resolve(common,"lib"),
        "$cauth":path.resolve(common,"auth"),
        "$cnavigation" : path.resolve(common,"navigation"),
        "$cplatform" : path.resolve(common,"platform"),
        "$cdimensions" : path.resolve(common,"platform/dimensions"),
        "$cobservable" : path.resolve(common,"lib","observable"),
        "$cvalidator" : path.resolve(common,"lib","validator"),
        "$cdate" : path.resolve(common,"lib","date"),
        "$cplatform" : path.resolve(common,"platform"),
        

        "$app" : path.resolve(src,"app"),
        "$media" : path.resolve(src,"media"),
        "$api" : path.resolve(src,"api"),
        "$i18n" : path.resolve(src,"i18n"),
        "$lib" : path.resolve(src,"lib"),
        "$auth":path.resolve(src,"auth"),
        "$navigation" : path.resolve(src,"navigation"),
        "$platform" : path.resolve(common,"platform"),
        "$dimensions" : path.resolve(common,"platform/dimensions"),
        "$observable" : path.resolve(common,"lib","observable"),
        "$validator" : path.resolve(common,"lib","validator"),
        "$crypto" : path.resolve(common,"lib","crypto-js"),
        "$date" : path.resolve(common,"lib","date"),
        "$crypto-js" : path.resolve(common,"lib","crypto-js"),
        "$ccountries" : path.resolve(common,"countries"),
        "$cdatabase" : path.resolve(common,"database"),
        "$database" : database,
        "$models" : path.resolve(database,"models"),
        "$schema" : path.resolve(database,"schema"),
        "$dbschema" : path.resolve(database,"schema"),
        "$dataTypes" : path.resolve(database,"schema","DataTypes"),
        "$data-types" : path.resolve(database,"schema","DataTypes"),
        "$data-sources" : path.resolve(database,"dataSources"),
        "$dataSources" : path.resolve(database,"dataSources"),
        "$ctheme" : path.resolve(common,"theme"),
        "$cnotify" : path.resolve(common,"notify"),
        "$notify" : path.resolve(common,"notify"),
        "$theme" : path.resolve(common,"theme"),
        "$cutils" : path.resolve(common,"utils"),
        "$utils" : path.resolve(common,"utils"),
        "$curi" : path.resolve(common,"utils","uri"),
        "$uri" : path.resolve(common,"utils","uri"),
        "$ccurrency" : path.resolve(common,"lib","currency"),
        "$csession" : path.resolve(common,"session"),
        
        "$currency" : path.resolve(common,"lib","currency"),
        "$session" : path.resolve(common,"session"),
        "$cbase64" : path.resolve(common,"lib","base-64"),
        "$base64" : path.resolve(common,"lib","base-64"),
        "$form" : path.resolve(src,"components","Form"),
        "$form-manager" : path.resolve(src,"components","Form/utils/FormManager"),
        "$preloader" : path.resolve(src,"components","Preloader"),
        "$cactions" : path.resolve(common,"actions"),
        "$actions" : path.resolve(common,"actions"),
        "$base" :base, 
        "$src" : src,
        "$active-platform" : path.resolve(common,"platforms",platform),
        "$common":common,
        "$ftc" : "@fto-consult",
        "$ftc-common":"@fto-consult/common",
        "$ftc-expo":"@fto-consulting/expo-ui"
    }
    if(assets){
        r["$assets"] = assets;
        r["$images"] = path.resolve(assets,"images");
        r["$css"] = path.resolve(assets,"css");
    }
    return r;
}