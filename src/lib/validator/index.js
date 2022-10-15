// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {observable,isObservable,addObserver } from "../observable";
import i18n from "$ci18n";
import {isNonNullString,isNullOrEmpty,defaultStr,isNumber,isValidEmail,isValidDataFileName} from "$cutils";
import APP from "$capp/instance";
import {isValidUrl} from "$cutils/uri";
import {UPPER_CASE,LOWER_CASE} from "./utils";
//import getData from "$database/getData";
import {isValidDate} from "$common/lib/date";

export * from "./utils";

let _validRules = undefined;



const numberLessThanOrEquals = {
    validator: function (value, param) {
        param = defaultArray(param);
        if(param[0] == undefined) return false;
        var val = parseFloat(param[0]);
        return value <= val;
    },
    message: 'Entrez un nombre inférieure ou égal à {0}'
};

export const getValidatorRules = ()=>{
    _validRules = {
        required : {
            validator : function(value,params){
                if(!isNullOrEmpty(value,true)) return true;
                if(typeof value == 'object'){
                    if(value == null) return false;
                    if(Array.isArray(value)){
                        return (value.length > 0)
                    } else return (Object.size(value,true) > 0)
                }
                return (value != '' & value != null & value != undefined) ? true : false;
            },
            message : i18n.lang("this_field_is_required")
        },
        /***
         * exemple : length[0,8] : compris entre 0 et 8 caractères
         * exemple : length[8] : doit avoir 8 caractères
         */
        length : {
            validator : function(value,params){
                value = defaultStr(value);
                let v0 = null,v1 = null;
                if(params[0]){
                    v0 = parseInt(params[0]) || null;
                }
                if(params[1]){
                    v1 = parseInt(params[1]) || null;
                }
                ///console.log(v0,' adn ',v1," adn ",value, params);
                if(isNumber(v0) && isNumber(v1)) {
                    return (value.length >= v0 && value.length <= v1)
                }
                if(isNumber(v0)){
                    ///on valide la longueur
                    return value.trim().length == v0;
                }
                return true;
                
            },
            message : function(params){
                if(params[0] && params[1]){
                    return i18n.lang('string_length_must_between')+' '+params[0]+' '+ i18n.lang('and')+' '+params[1]+' '+ i18n.lang('characters')
                }
                if((params[0])){
                    return "ce champ doit avoir "+params[0]+" " + i18n.lang('characters')
                }    
                return 'validation longueur inconnue';
            }
        },
        email : {
            validator : function(value,param){
                /*** si la valeur est vide dans ce cas on retourne true, le validateur d'email doit normalement s'accompagner de la valeur required */
                return isValidEmail(value,false);
            },
            message : i18n.lang("enter_valid_email")
        },
        url : {
            validator : function(value,param){
                /*** si la valeur est vide dans ce cas on retourne true, le validateur d'email doit normalement s'accompagner de la valeur required */
                if(!isNonNullString(value)) return true;
                return isValidUrl(value);
            },
            message : i18n.lang("enter_valid_url")
        },
        dataFileName : {
            validator : (value,escapeDot)=>{
                if(!isNonNullString(value)) return true;
                return isValidDataFileName(value,escapeDot);
            },
            message : "Veuillez renseigner un code ne contenant pas d'espace ou de caractère accentués"
        },
        minLength: {
            validator: function(value, param){
                if(typeof value === 'object') {return false;}
                if(value == undefined) value = "";
                value = value.toString();
                return value.length >= param[0];
            },
            message: i18n.lang('validate_rule_must_have')+' '+i18n.lang('validaterule_at_lest') +' {0} characters.'
        },
        maxLength: {
            validator: function(value, param){
                if(typeof value === 'object') {return false;}
                if(value == undefined) value = "";
                value = value.toString();
                return value.length <= param[0];
            },
            message: i18n.lang('validate_rule_must_have')+' '+i18n.lang('validaterule_at_most') +' {0} characters.'
        },
        number : {
            validator: function(value, param){
                var bool = (typeof value == 'number' )? true : false;
                return bool;
            },
            message: i18n.lang('validaterule_number')
        },
        
        callback : {
            validator : function(){
                if(typeof this.validatorCallback == 'function'){
                    return this.validatorCallback.apply(this,Array.protype.slice.call(arguments,0));
                }
                return true;
            },
            message : ""
        },
        filename : {
            validator : function(fname, param){
                var rg1=/^[^\\/:\*\?"<>\|]+$/; // forbidden characters \ / : * ? " < > |
                var rg2=/^\./; // cannot start with dot (.)
                var rg3=/^(nul|prn|con|lpt[0-9]|com[0-9])(\.|$)/i; // forbidden file names
                if(!isNonNullString(fname)) return false;
                return rg1.test(fname)&&!rg2.test(fname)&&!rg3.test(fname);
            },
            message: 'Veuillez entrer un nom de fichier valide'
        },
        uniqueid : { 
            /*** valide l'id de valeur value,
             *  @param : chaine de caractère portant le nom de la base, si param est omis alors c'est la base par défaut qui est utilisée
             *  @param : la valeur à valider
             *  @param : le nom de la base de données, au cas où c'est null, c'est la base par défaut
             *  @param : le nom de la table à faire valider : Doit être en majuscule
            */
            validator: function(value, dbName,tableName,e){
                if(isNonNullString(value)){
                    if(_validRules && !_validRules.dataFileName.validator(value,true)){
                        return _validRules.dataFileName.message;
                    } else if(!_validRules && value.trim().contains(" ")){
                        return "le texte entré ne doit contenir auccun espace";
                    }
                }
                ///le validateur ne doit pas conteir de caractère /
                if(value.contains("/")){
                    return "la valeur entrée ne doit pas contenir de caractère <</>>";
                }
                if(!isNonNullString(value)) return true;
                let findOptions = {selector:{}};

                /*** le nom du champ à utiliser pour la validation peut être définit dans le 3ème paramètre du tableau */
                let fieldName = "_id";         
                
                /*** l'on peut décider de préfixer la valeur de l'id à faire valider
                 *  dans ce cas, il faudra renseigner le 4ème du tableau comme prefix à ajouter à la valeur id à afire valider
                 */
                let prefix = "";   
                /*****
                 *  t[0] : le nom de la base
                 *  t[1] : le nom de la table
                 *  t[2] : le friendly name du champ à faire valider
                 *  t[3] : le nom du champ en bd, à utiliser pour la validation
                 *  t[4] : la valeur du préfix à utiliser pour préfixer la valeur Value
                 */
                if(Array.isArray(dbName)) {
                    let t = dbName;
                    prefix = t[4] || prefix;
                    fieldName = t[3] || fieldName;
                    dbName = t.shift(0);
                    if(Array.isArray(t) && t){
                        tableName = t.shift(0);
                    }
                }
                value = prefix+value;
                
                tableName = defaultStr(tableName).trim().toUpperCase();
                if(isNonNullString(tableName)){
                    findOptions.selector["$and"]= [{[fieldName]:{$eq:value}}];
                    value = "["+tableName.trim()+"]";
                } else {
                    value = "["+value.trim()+",null]";
                }

                if(isNonNullString(dbName)){
                    //le nom de la base est définit
                    value = dbName+value
                } else if(dbName && typeof dbName=="object") {
                    return 'MS unique Validator : paramètre incorect, vous devez préciser le nom de la base dans laquelle rechercher l\'id';
                }
                return new Promise((resolve,reject)=>{
                    setTimeout(() => {
                        return false;
                        getData(value,findOptions).then((data,allData)=>{
                            if(isNullOrEmpty(data)) resolve(true);
                            else resolve(false);
                        }).catch((e)=>{resolve(true);})
                    }, (0.1));
                })
                
            },
            message: i18n.lang('validate_rule_field_must_be_unique')+ " {2}"
        },
        english : {// Test of English
            validator : function(value) {
                return /^[A-Za-z]+$/i.test(value);
            },
            message : 'Please enter English'
        },
        ip : {// Verify that the IP address
            validator : function(value) {
                return /\d+\.\d+\.\d+\.\d+/.test(value);
            },
            message : 'The IP address is not in the correct format'
        },
        ZIP: {
            validator: function (value, param) {
                    return /^[0-9]\d{5}$/.test(value);
            },
            message: 'Postal code does not exist'
        },
        QQ: {   
            validator: function (value, param) {
                    return /^[1-9]\d{4,10}$/.test(value);
            },
            message: 'The QQ number is not correct'
        },
        mobile: {
                validator: function (value, param) {
                        return /^(?:13\d|15\d|18\d)-?\d{5}(\d{3}|\*{3})$/.test(value);
                },
                message: 'Le numéro de téléphone n\'est pas correct'
        },
        tel:{
                validator:function(value,param){
                        return /^(\d{3}-|\d{4}-)?(\d{8}|\d{7})?(-\d{1,6})?$/.test(value);
                },
                message:'The phone number is not correct'
        },
        mobileAndTel: {
                validator: function (value, param) {
                        return /(^([0\+]\d{2,3})\d{3,4}\-\d{3,8}$)|(^([0\+]\d{2,3})\d{3,4}\d{3,8}$)|(^([0\+]\d{2,3}){0,1}13\d{9}$)|(^\d{3,4}\d{3,8}$)|(^\d{3,4}\-\d{3,8}$)/.test(value);
                },
                message: 'Please input correct phone number'
        },
        number: {
                validator: function (value, param) {
                    //if(value ===undefined) return true;
                    return  /^-{0,1}\d*\.{0,1}\d+$/.test(value)
                    return /^[0-9]+?[0-9]*$/.test(value);
                },
                message: 'Entrez un nombre s\'il vous plait'
        },
        [UPPER_CASE] : {
            validator : function(value) {
                if(typeof value !== 'string') return false;
                return value.toUpperCase() === value ? true : false;
            },
            message : 'Entrer une chaine de caractère en majuscule s\'il vous plait'
        },
        [LOWER_CASE] : {
            validator : function(value) {
                if(typeof value !== 'string') return false;
                return value.toLowerCase() === value ? true : false;
            },
            message : 'Entrer une chaine de caractère en minuscule s\'il vous plait'
        },
        decimal : {
            validator : function(value,param) {
                //if(value ===undefined) return true;
                if(isNumber(value)) return true;
                return /^-{0,1}\d*\.{0,1}\d+$/.test(value);
            },
            message : 'Entrer un nombre décimal s\'il vous plait'
        },
        numeric : { //les nombres soit décimaux, soit entiers
            validator : function(value,param) {
                return /^-{0,1}\d*\.{0,1}\d+$/.test(value);
            },
            message : 'Entrer un nombre décimal s\'il vous plait'
        },
        money:{
            validator: function (value, param) {
                    return (/^(([1-9]\d*)|\d)(\.\d{1,2})?$/).test(value);
                },
                message:'Please enter the correct amount'

        },
        integer:{
                validator:function(value,param){
                        return /^[+]?[1-9]\d*$/.test(value);
                },
                message: 'Please enter a minimum of 1 integer'
        },
        integ:{
                validator:function(value,param){
                        return /^[+]?[0-9]\d*$/.test(value);
                },
                message: 'Please enter an integer'
        },
        range:{
                validator:function(value,param){
                        if(/^[1-9]\d*$/.test(value)){
                            return value >= param[0] && value <= param[1]
                        }else{
                            return false;
                        }
                },
                message:'The number of input in the {0} to {1}'
        },
        //Select is the selection box verification
        selectValid:{
            validator:function(value,param){
                    if(value == param[0]){
                            return false;
                    }else{
                            return true ;
                    }
            },
            message:'Please select'
        },
        idCode:{
                validator:function(value,param){
                        return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(value);
                },
                message: 'Please enter a valid identity card number'
        },
        loginName: {
                validator: function (value, param) {
                        return /^[\u0391-\uFFE5\w]+$/.test(value);
                },
                message: 'The logon name only allows Chinese characters, letters, numbers and underscores English. '
        },
        lessThan : {
            validator: function (value, param) {
                param = defaultArray(param);
                var val = param[0];
                return value < val;
            },
            message: 'Entrez une valeur strictement inférieure à {0}'
        },
        lessThanOrEquals : {
                validator: function (value, param) {
                param = defaultArray(param);
                var val = param[0];
                return value <= val;
                },
                message: 'Entrez une valeur inférieure  ou égale à {0}'
        },
        numberLessThan : {
            validator: function (value, param) {
                param = defaultArray(param);
                if(param[0] == undefined) return false;
                var val = parseFloat(param[0]);
                return value < val;
            },
            message: 'Entrez un nombre strictement inférieure à {0}'
        },
        numberLessThanOrEquals : numberLessThanOrEquals,
        numberLessOrEquals :  numberLessThanOrEquals,
        numberEqualsTo : {
            validator: function (value, param) {
                param = defaultArray(param);
                if(param[0] == undefined) return false;
                var val = parseFloat(param[0]);
                return value == val;
                },
                message: 'Entrez un nombre égal à {0}'
        },
        /*** nombre compris entre param[0] && param[1] */
        numberBetween : {
            validator: function (value, param) {
                param = defaultArray(param);
                if(param[0] == undefined || param[1] == undefined) return false;
                return value >= parseFloat(param[0]) && value <= parseFloat(param[1]);
                },
                message: 'Entrez un nombre compris entre {0} et {1}'
        },
        numberGreaterThan : {
            validator: function (value, param) {
                param = defaultArray(param);
                if(param[0] == undefined) return false;
                var val = parseFloat(param[0]);
                return value > val;
                },
                message: 'Entrez un nombre strictement supérieur à {0}'
        },
        numberGreaterThanOrEquals : {
            validator: function (value, param) {
                param = defaultArray(param);
                if(param[0] == undefined) return false;
                var val = parseFloat(param[0]);
                return value >= val;
                },
                message: 'Entrez un nombre supérieur ou égal à {0}'
        },
        greaterThan : {
            validator: function (value, param) {
                param = defaultArray(param);
                var val = param[0];
                return value >= val;
                },
                message: 'Entrez un nombre supérieur ou égal à {0}'
        },
        equalTo: {
                validator: function (value, param) {
                    param = defaultArray(param);
                    var val = ((param[0] != undefined)? param[0] : param[0]);
                    return value == val;
                },
                message: 'la valeur entrée doit être égale à {0}'
        },
        englishOrNum : {// English and digital input only
            validator : function(value) {
                return /^[a-zA-Z0-9_ ]{1,}$/.test(value);
            },
            message : 'Please enter English, digital, underlined or spaces'
        },
        date : {
            validator : function(value,format){
                if(format && format.format){
                    format = format.format;
                }
                return isValidDate(value,format);	
            },
            message : function(params){
                if(isNonNullString(params)){
                    params = "\nFormat : "+params;
                } else params = "";
                return i18n.lang("please_enter_a_valid_date")+"  "+params;
            }
        },
        xiaoshu:{ 
            validator : function(value){ 
            return /^(([1-9]+)|([0-9]+\.[0-9]{1,2}))$/.test(value);
            }, 
            message : 'Up to two decimal places！'    
        },
        ddPrice:{
            validator:function(value,param){
                    if(/^[1-9]\d*$/.test(value)){
                            return value >= param[0] && value <= param[1];
                    }else{
                            return false;
                    }
            },
            message:'Please enter a positive integer between 1 to 100'
        },
        jretailUpperLimit:{
            validator:function(value,param){
                    if(/^[0-9]+([.]{1}[0-9]{1,2})?$/.test(value)){
                            return parseFloat(value) > parseFloat(param[0]) && parseFloat(value) <= parseFloat(param[1]);
                    }else{
                            return false;
                    }
            },
            message:'Please enter between 0 to 100 up to two decimal digits'
        },
        rateCheck:{
            validator:function(value,param){
                    if(/^[0-9]+([.]{1}[0-9]{1,2})?$/.test(value)){
                            return parseFloat(value) > parseFloat(param[0]) && parseFloat(value) <= parseFloat(param[1]);
                    }else{
                            return false;
                    }
            },
            message:'Please enter between 0 to 1000 up to two decimal digits'
        }, 
        matchField : {
            //si le champ a la même value que celui passé en paramètre
            validator : function(value,param){
                var opts = $.data(this.__target, 'ms-form').options;
                if(!param[0]) return false;
                var field = opts.formFields[param[0]]
                if(field.$field){
                    return field.getValue() == value ? true : false;
                } else return false;
            },
            message : function(params){
                var _f = this.label
                var f = params[1] || params[0]
                return i18n.lang("the_fields")+" "+_f+" "+i18n.lang("and")+" "+f+" "+i18n.lang("mus_have_the_same_values")
            }
        }
    };
    _validRules.equalsTo = _validRules.equalTo;
    return _validRules;
}
const APP_Validator = {
    rules : getValidatorRules(),//permet de checker si l'élément passé en paramètre réussi le test de validation
    /**
     * @param validRule, la règle de validation : 
     * @return, un objet observable, qui appelera l'objet onValidatorValid si la validation est ok 
     * et onValidatorNoValid si la validation n'est pas éffective
     */
    isValid : function(validRule,validValue){
        var context = {};
        if(!isObservable(context)){
            observable(context);
            addObserver(context);
        }
        setTimeout(function(){
            APP_Validator.validate({context,value:validValue,validRule,validType:validRule});
        },1);
        return context;
    },
    validate : function({context,value,validRule,event,validType,validParams,extra,...rest}){
        rest = defaultObj(rest);
        validRule = defaultVal(validRule,validType)
        if(context === null | typeof(context) != 'object') {
            return false;
        }
        if(!isObservable(context)){
            observable(context);
            addObserver(context);
        }
        setTimeout(()=>{
            context.trigger("validatorBeforeValidate",{value,event,context,validType,validRule,validParams,extra,...rest},(result)=>{
                for(var t in result){
                    if(result[t] === false) return context;
                }
                validParams = validParams || []// || validParams;
                if(isNullOrEmpty(validRule)){
                    ///ajout de la fonction validationCheck, qui permet de vérifier à nouveau la validation une fois les critères précédents accomplis
                    if(isFunction(rest.onValidatorValid)){
                        let __r = rest.onValidatorValid.call(context,{value,event,context,validType,validRule,validParams,extra,...rest});
                        if(isNonNullString(__r)){
                            return context.trigger('validatorNoValid',{...rest,event,msg:__r,message:__r,value,context,validParams,extra});
                        } else if(isObj(__r)){
                            let d_r = defaultStr(__r.msg,__r.message);
                            if(isNonNullString(d_r)){
                                return context.trigger('validatorNoValid',{...rest,event,msg:d_r,message:d_r,value,context,validParams,extra});
                            }
                        }
                    }
                    //console.warn(" ms-validator invalid rule ",validRule);
                    return context.trigger('validatorValid',{...rest,value,context,extra,event,validRule,validType:validRule,extra});
                } 
                var i=0,r=null,countEl;
                if(typeof(validRule) === "string"){
                    var validators = validRule.split('|')
                    i = 0; countEl = validators.length-1;
                    var next = function(){
                        if(i > countEl) {
                            ///ajout de la fonction validationCheck, qui permet de vérifier à nouveau la validation une fois les critères précédents accomplis
                            if(isFunction(rest.onValidatorValid)){
                                let __r = rest.onValidatorValid.call(context,{value,event,context,validType,validRule,validParams,extra,...rest});
                                if(isNonNullString(__r)){
                                    return context.trigger('validatorNoValid',{...rest,event,msg:__r,message:__r,value,context,validParams,extra});
                                } else if(isObj(__r)){
                                    let d_r = defaultStr(__r.msg,__r.message);
                                    if(isNonNullString(d_r)){
                                        return context.trigger('validatorNoValid',{...rest,event,msg:d_r,message:d_r,value,context,validParams,extra});
                                    }
                                }
                            }
                            return context.trigger('validatorValid',{...rest,value,context,extra,event,validRule,validType:validRule,extra});
                        }
                        var _p = validators[i]
                        var _vRule = '';
                        if(_p.indexOf("[") > -1){
                            var _sp = _p.split("[")
                            _vRule = _sp[0];
                            var spl = _sp[1].split(",")
                            validParams = []
                            for (var t in spl){
                                spl[t] = spl[t].replace("]","")
                                validParams.push(spl[t])
                            }
                        } else {
                            _vRule = _p
                        }
                        if(isNullOrEmpty(_p)) {
                            i++;
                            return next();
                        } 
                        r = APP_Validator._validate({...rest,type:APP_Validator.rules[_vRule],context,value,validRule:_vRule,validType:_vRule,validParams,extra});
                        if(r == true | r > 0){
                            i++;
                            return next();
                        } else if(isPromise(r.result)){
                            r.result.then(function(result){
                                if(result === true){
                                    i++;
                                    next();
                                } else {
                                    i=-1;
                                    context.trigger("validatorNoValid",{...rest,message:r.msg,msg:r.msg,value,context,validRule:_vRule,validType:_vRule,validParams,extra});
                                    return context;
                                }
                            }).catch(function(e){
                                var sg = '';
                                if(isNonNullString(e)){
                                    sg = e;
                                }else if(e){
                                    if(isNonNullString(e.message)){
                                        sg = e.message;
                                    } else if(isNonNullString(e.msg)){
                                        sg = e.msg;
                                    } else if(isNonNullString(e.error)){
                                        sg = e.error;
                                    }
                                }
                                return context.trigger('validatorNoValid',{...rest,event,message:sg,msg:sg,value,context,validRule:_vRule,validType:_vRule,validParams,extra})
                            })
                        } else {
                            i = -1;
                            return context.trigger("validatorNoValid",{...rest,event,message:r.msg,msg:r.msg,value,context,validRule:_vRule,validType:_vRule,validParams,extra});
                        }
                    }
                    next();
                } else if(typeof validRule == 'function'){
                    //lorque le validator est une fonction, celle ci a comme contexte, l'objet passé en paramètre au validateur
                    r = validRule.call(context,{value,event,context,validType,validRule,validParams,extra,...rest});
                    if(isNonNullString(r)){
                        ///ajout de la fonction onValidationCheck, qui permet de vérifier à nouveau la validation une fois les critères précédents accomplis
                        if(isFunction(rest.onValidatorValid)){
                            let __r = rest.onValidatorValid.call(context,{value,event,context,validType,validRule,validParams,extra,...rest});
                            if(isNonNullString(__r)){
                                return context.trigger('validatorNoValid',{...rest,event,msg:__r,message:__r,value,context,validParams,extra});
                            } else if(isObj(__r)){
                                let d_r = defaultStr(__r.msg,__r.message);
                                if(isNonNullString(d_r)){
                                    return context.trigger('validatorNoValid',{...rest,event,msg:d_r,message:d_r,value,context,validParams,extra});
                                }
                            }
                        }
                        return context.trigger('validatorNoValid',{...rest,event,msg:r,message:r,value,context,validParams,extra});
                    }
                    if(isPromise(r)){
                        r = {
                            result : r
                        }
                    } else if(isNonNullString(r)){
                        r = {msg : r};
                    }
                    if(r === true){
                        ///ajout de la fonction validationCheck, qui permet de vérifier à nouveau la validation une fois les critères précédents accomplis
                        if(isFunction(rest.onValidatorValid)){
                            let __r = rest.onValidatorValid.call(context,{value,event,context,validType,validRule,validParams,extra,...rest});
                            if(isNonNullString(__r)){
                                return context.trigger('validatorNoValid',{...rest,event,msg:__r,message:__r,value,context,validParams,extra});
                            } else if(isObj(__r)){
                                let d_r = defaultStr(__r.msg,__r.message);
                                if(isNonNullString(d_r)){
                                    return context.trigger('validatorNoValid',{...rest,event,msg:d_r,message:d_r,value,context,validParams,extra});
                                }
                            }
                        }
                        return context.trigger('validatorValid',{...rest,event,value,context,extra});
                    } else if(isObj(r)){
                        if(isPromise(r.result)){
                            r.result.then(function(_result){
                                if(_result === true){
                                    ///ajout de la fonction validationCheck, qui permet de vérifier à nouveau la validation une fois les critères précédents accomplis
                                    if(isFunction(rest.onValidatorValid)){
                                        let __r = rest.onValidatorValid.call(context,{value,event,context,validType,validRule,validParams,extra,...rest});
                                        if(isNonNullString(__r)){
                                            return context.trigger('validatorNoValid',{...rest,event,msg:__r,message:__r,value,context,validParams,extra});
                                        } else if(isObj(__r)){
                                            let d_r = defaultStr(__r.msg,__r.message);
                                            if(isNonNullString(d_r)){
                                                return context.trigger('validatorNoValid',{...rest,event,msg:d_r,message:d_r,value,context,validParams,extra});
                                            }
                                        }
                                    }
                                    return context.trigger('validatorValid',{...rest,event,value,context,extra});
                                } else {
                                    if(isNonNullString(_result)){
                                        let mg = _result;
                                        return context.trigger("validatorNoValid",{...rest,event,message:mg,msg:mg,value,context,validRule,validType:validRule,validParams,extra});
                                    } else if(isObj(_result)){
                                        let mg = r.msg || r.message;
                                        return context.trigger("validatorNoValid",{...rest,event,message:mg,msg:mg,value,context,validRule,validType:validRule,validParams,extra});
                                    } else {
                                        let mg = 'Error non spécifiée!!';
                                        return context.trigger("validatorNoValid",{...rest,event,message:mg,msg:mg,value,context,validRule,validType:validRule,validParams,extra});
                                    }
                                }
                            }).catch((e)=>{
                                e = defaultObj(e);
                                let mg = defaultStr(e.message,e.msg,'Error non spécifiée!!');
                                return context.trigger("validatorNoValid",{...rest,event,message:mg,msg:mg,value,context,validRule,validType:validRule,validParams,extra});
                            });
                        } else if(r.result === false){
                            return context.trigger("validatorNoValid", {...rest,event,msg:r.msg,message:r.msg,value,context,validRule,validParams,extra,validType:validRule});
                        }
                    }
                }   
            });//triger before validate
        },1);
        return context;
    },//validate when rule as properly defined
    _validate : function({type,context,value,validRule,validType,validParams,extra,...rest}){
        rest = defaultObj(rest);
        let _vRule = defaultVal(validRule,validType)
        let vP = Array.isArray(validParams)? [...validParams] : isObj(validParams) ? {...validParams} : validParams;
        var $return = false,msg ='';
        if(!type){
            return {
                msg : 'APP_Validator not right validation type -  for rule : '+_vRule,
                result : false
            }
        }
        if(isFunction(type)) {
            $return = type.call(context,value,vP,extra) || false;
        } else if(isObj(type) && isFunction(type.validator)){
            $return = type.validator.call(context,value,vP) || false;
            msg = type.message || type.errorMsg || type.msg || msg;
        }
        if($return == true || $return > 0) return true;
        if(isNonNullString($return)){
            return {
                msg : $return,
                result : false
            };
        } else if(isFunction($return)){
            msg = $return;
            $return = false;
        }
        if(isFunction(msg)){
            msg = msg.call(context,vP);
        }
        if(typeof msg === "string"){
            if(isObj(validParams) | Array.isArray(validParams)){
                for(var i in validParams){
                    msg = msg.replace(new RegExp("\\{"+i+"\\}","g"),validParams[i]);
                }
            }
        } 
        if(isNullOrEmpty(msg)) msg = '';
        return {
            msg : msg,
            result : $return
        }
    }
}
i18n.on("ready",()=>{
    APP_Validator.rules = getValidatorRules();
})

export default APP_Validator;

export const Validator = APP_Validator;

if(!APP.Validator){
    Object.defineProperties(APP,{
        Validator : {value:Validator}
    })
}