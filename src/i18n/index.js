
import { observable } from "$lib/observable";
import { i18nFrLang } from "./lang/i18n.fr";
import { i18nEnLang } from "./lang/i18n.en";
import extendObj  from "$utils/extendObj";
import isNonNullString from "$utils/isNonNullString";
import {getLang,setLang} from "./session";

var i = i || 0,j = j || 0; //fix somme for loops bug


export const i18n = new I18n();

/***
 * used to retrieve lang value in dl language file
 * @param {type} label
 * @returns {MS_lang.label}
 */
export function lang(label,def) {
    return i18n.lang(label,def);
}
export function I18n() {
    this._entities = {}
    this._default = getLang(),
    this._language = this._default
    var obs = observable(this)
    this.obs = obs; 
    var self = this
}

/*
    * Ajoute les texte dans le dictionnaire du traducteur.
    * Si lang_code est null, alors dic doit être un objet constitué de la langue et des éléments de dictionnaires correspondant à cette langue
    * Exemple : dic = {en : {label1:"text1"}
    * Si lang_code existe, alors dic doit etre juste les éléments du dictionnaire. Exemple : dictionary({label1:'text1'},"en")
    * Exemple dictionary('en' : {label1 : 'Text1',label2:'text2'},'fr' : {label1:'TextFr1',label2:'textFr2'})
    * dictionary({label1:'textFr1',label2:'textFr2'},'fr')
    * @param {type} dict
    * @param {type} lang_code
    * @returns {undefined}
    */
I18n.prototype.dictionary = function(dict,lang_code) {
    if(typeof lang_code == "undefined") {
        for (var i in dict){
            this._dictionary(i,dict[i])
        }
    } else if(typeof dict == "string" && lang_code && typeof lang_code == "object") {
        this._dictionary(dict,lang_code)
    } else if(typeof dict == "object" && typeof lang_code == "string") {
        this._dictionary(lang_code,dict)
    } 
    this.obs.trigger('update',{lang:lang_code,dictionary:dict})
}

I18n.prototype._dictionary = function (lang_code,langs){
    if(typeof langs == "string" & typeof lang_code == "string") {
        return false;
    } else if(typeof lang_code == "object" & typeof langs == "string"){
        var _l = langs
        langs = lang_code
        lang_code = _l
    } else if(typeof lang_code =="object" & typeof langs == "object"){
        return false;
    }

    var _l2 = {}
    _l2[lang_code] = langs
    extendObj(true,this._entities,_l2)
}

I18n.prototype.defaultLanguage = function(lang) {
    this._default = lang || getLang();
    setLang(this._default);
}

/**** permet de traduire l'élément dont la clé est passée en paramètre
 * @param : key {string|object} la clé à traduire
 * @param : data {object} le dictionnaire des données à utiliser
 * @param : langCode {string}: le code de langue à utiliser lorsqu'il n'est pas définit, c'est la langue par défaut qui est utilisée
 */
I18n.prototype.lang = function(key, data,lang_code) {
    this._language = this._language || this._default || getLang();
    let _r = isNonNullString(key)? key : '';
    if(typeof key == "object" && key){
        for (var i in key){
            _r+=this.localise(key[i],data,lang_code)
        }
    } else if(isNonNullString(key)){
        _r = this.localise(key,data,lang_code)
    }
    return _r;
}
I18n.prototype.localise = function(key, data,lang_code) {
    var substitute, locale;
    let language = isNonNullString(lang_code)? lang_code : this._language;
    if(!this._entities[language]){
        language = this._language;
    }
    function flatten(n, f, d, k) {
        k = k || "", f = f || {}, d = d || 0
        var nObj = typeof n ==='object' && n && !n.length,
            nKeys = nObj ? Object.keys(n).length : 0;

        if (nObj && nKeys > 0) {
            var i;
            for (i in n) {
                if (k.split('.').length > d) { k = k.split('.').splice(0, d).join('.') }
                k = (d == 0) ? i : k + "." + i, f = flatten(n[i], f, d + 1, k)
            }
        } else f[k] = n;
        return f;
    }
    if (!this._entities[language]) {
        // When a language is not provided,
        // treat the key as substitution
        substitute = key;
    }
    if (!substitute) {
        locale = flatten(this._entities[language]);
        if (!locale[key]) {
            // When a translation is not
            // provided, just return the original text.
            substitute = key
        } else {
            // return the language substitue for the original text
            substitute = locale[key];
        }
    }
    
    /*** la langue par défaut */
    if(isNonNullString(data) && (!substitute || substitute ===key)){
        return data;
    }
    if (data && typeof data =='object') {
        var _data = flatten(data),
            _key;
        for (_key in _data) {
            substitute = substitute.replace(new RegExp("{" + _key + "}", "g"), _data[_key]);
        }
    }

    return substitute;
}

/*** 
 *  tous les fichiers de langue sont en miniscule
 *  @param string oneOfType : ['en,fr'] //les deux langues prises en compte pour le moment sont l'anglais et le français
 *  @param func cb : la fonction de rappel au cas où la langue a été chargée, prend en paramètre la langue chargée
 * 
 */
I18n.prototype.setLanguage = I18n.prototype.setLang = function(lang,cb) {
    if(!isNonNullString(lang)) lang = this._default || getLang();
    /*if(!arrayValueExists(lang.toLowerCase(),["en","fr"])){
        lang = this._default;
    }*/
    this._language = lang.toLowerCase();
    setLang(this._language);
    /// lorsque le fichier de langue est chargé
    this.obs.trigger("load",(results)=>{
        /**** l'évènement load a pour effet de demander le chargement de toutes les langues de l'application
         *  chaque écouter de l'évènement load doit retourner soit un chaine de caractère contenant l'ensemble des fichiers de langues à charger
         *  soit un tableau de chemin complet des fichiers de langues à charger
         *  une fois toutes les langues chargées, le gestionaire de langue invoque l'évènemnet ready
         */
        let promises = []
        for(let i in results){
            if(!isNullOrEmpty(results[i])){
                promises.push(loadJS(results[i]));   
            }
        }
        Promise.all(promises).then(()=>{
            /*** lorsque toutes les langues ont été chargées */
            this.obs.trigger('update',{lang,dictionary:{}},()=>{
                this.obs.trigger("ready",{lang,dictionary:{}});
                if(typeof (cb) ==='function'){
                    cb({lang,dictionary:{}});
                }
            })
        })
    })
    return this;
}
I18n.prototype.setLang = function(lang,cb) {
    return this.setLanguage(lang,cb)
}

I18n.prototype.getLanguage = function() {
    return this._language || this._default;
}

I18n.prototype.getLang = function() {
    return this.getLanguage()
}

i18n.dictionary(i18nEnLang);
i18n.dictionary(i18nFrLang);

export default i18n;