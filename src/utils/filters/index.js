// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

/**** utilitaire de filtre de requêtes, ensemble de fonctions utiles pour l'implémentationd 'un composant Filter */
import {isNonNullString,defaultStr,defaultNumber,defaultBool,extendObj,defaultObj,defaultArray,isObjOrArray,isObj} from "$cutils";
import i18n from "$i18n";
import DateLib from "$lib/date";
import mangoParser from "mongo-parse";
import "./i18n";
import session from "$session";
import {getLoggedUserCode} from "$cauth/utils";
import { escapeSQLQuotes } from "../string";

export const filterTextTypes = ['text','number','email','search','tel','url','password',"id","idfield",'piecefield','piece'];

export const regexActions = {
    get $regexequals (){ return i18n.lang("filter_regex_equals")},
    get $regexcontains () {return i18n.lang("filter_regex_contains")},
    get $regexnotcontains () {return i18n.lang("filter_regex_notcontains")},
    get $regexnotequals () {return i18n.lang("filter_regex_notequals")},
    get $regexstartswith () {return i18n.lang("filter_regex_startswith")},
    get $regexendswith () {return i18n.lang("filter_regex_endswith");}
 }
export const escapeRegexChars = (value)=>{
    //if(value === undefined || value ===null || value === '' || value ==='undefined') return '';
    //value+='';
    if(!isNonNullString(value)) return '';
    let escapeChars = ['!', '^', '$', '(', ')', '[', ']', '{', '}', '?', '+', '*', '.', '/', '\\', '|']
    for(var i in escapeChars){
        value.replace(escapeChars[i],'\\'+escapeChars[i]);
    }
    return value.toString();
}

export const getFilterStateValues = (state)=>{
    state = defaultObj(state);
    const r = {};
    ['defaultValue','action','actions','operator','operators','ignoreCase','value','manualRun'].map((v)=>{
      r[v] = state[v];
    })
    return r;
  
}

/**** si le filtre peut être pris en compte */
export const canHandleFilter = (f)=>{
    if(!isObj(f)) return false;
    if(!isNonNullString(f.operator) || !isNonNullString(f.action)) {
        return false;
    }
    if(f.value === undefined || f.value === 'undefined' || f.value ==='' || f.value ===null) {
        return false;
    }
    if(f.value instanceof RegExp){
        return true;
    }
    if(isObjOrArray(f.value) && Object.size(f.value,true) <=0) return false;
    return true;                    

}

export const regexExpressions = {
    notcontains : {
        left : "^((?!(",
        right : ")).)*$",
        /***@see : https://www.w3schools.com/sql/sql_like.asp */
        sql : (string)=>{
            return "%"+defaultStr(string).ltrim("%").rtrim("%")+"%";
        }
    },
    notequals : {
        left : "^(?!",
        right : "$).*$",
    },
    equals : {
        left : "/^",
        right : '$/'
    },
    startswith : {
        left : "/^",
        right : '/',
        sql : (string)=>{
            return defaultStr(string).rtrim("%")+"%";
        }
    },
    endswith : {
        left : "",
        right : '$/',
        sql : (string)=>{
            return "%"+defaultStr(string).ltrim("%");
        }
    },
    contains : {
        left : "/",
        right : '/',
        sql : (string)=>{
            return "%"+defaultStr(string).ltrim("%").rtrim("%")+"%";
        }
    },
}
/**** prend en paramètre une chaine de caractère et un nom d'opérateur et génère 
 *  la chaine de caracètre mango regex correspondant
 */
const toMangoRegex = (val,operator)=>{
    if(!isNonNullString(val) || !isNonNullString(operator) || !regexExpressions[operator]) return "";
    const rOp = regexExpressions[operator];
    return rOp.left+escapeRegexChars(val)+rOp.right;
}
export const regexParser = {
    equals : (val)=> {
        return toMangoRegex(val,"equals");
    },
    startswith : (val) => {
        return toMangoRegex(val,"startswith");
    },
    endswith : (val) => {
        return toMangoRegex(val,"endswith");
    },
    contains : (val) => {
        return toMangoRegex(val,"contains");
    },
    notequals : (val) => {
       return toMangoRegex(val,"notequals");
    },
    notcontains : (val) =>{
       return toMangoRegex(val,"notcontains");
    }
}
/*** prend une expression regulière et le convertis en operateur, valeur 
 * @param {string} la valeur otenue au format regex
*/
export const regexDeparser = (regexValue)=>{
    if(!regexValue) return null;
    regexValue = regexValue.toString();
    if(regexValue.endsWith("/i")){
        regexValue = regexValue.rtrim("/i")+"/";
    }
    if(!isNonNullString(regexValue)) return null;
    for(let i in regexExpressions){
        const p = regexExpressions[i];
        let rVal = regexValue.ltrim("/").rtrim("/");
        const pLeft = p.left.ltrim("/"),pRight = p.right.rtrim("/");
        if(rVal.startsWith(pLeft) && rVal.endsWith(pRight)){
            return {
                operator : i,
                value : rVal.ltrim(pLeft).rtrim(pRight),
                regexValue : rVal,
            }
        }
    }
    return null;
}
export const matchPouchDBOperator = (operator,value)=>{
    if(!isNonNullString(operator)) return null;
    if(!(value) && !isDecimal(value)) return null;
    switch(operator){
        case "MATCH":
            if(isDecimal(value)) value +="";
            return {operator:"$regex",value:RegExp(defaultStr(regexParser.contains(value)).ltrim("/").rtrim("/"),'i')}
        case "NOTMATCH": 
          if(isDecimal(value)) value +="";
           return {operator:"$regex",value:RegExp(defaultStr(regexParser.notcontains(value)).ltrim("/").rtrim("/"),'i')}
        case "EQ" : 
            return {operator:'$eq',value}
        case "NEQ" : 
            return {operator:"$ne",value}
        case "GT":
          return {operator:"$gt",value}
        case "GTE":
            return {operator:"$gte",value}
        case "LT":
          return {operator:"$lt",value}
        case "LTE":
          return {operator:"$lte",value}
        case "IN":
            return {operator:"$in",value}
        case "NOT IN":
            return {operator:"$in",value}
    }
  }

let Operators = {
    NONE: null,
    MATCH: {
        name: i18n.lang("filter_regex_contains").toLowerCase(),
        func: function(value, term) {
            if(value) {
                return value.toString().search(utils.isRegExp(term) ? term : new RegExp(term, 'i')) >= 0;
            } else {
                return !(!!term);
            }
        },
        regexpSupported: true
    },
    NOTMATCH: {
        name: i18n.lang("filter_regex_notcontains").toLowerCase(),
        func: function(value, term) {
            if(value) {
                return value.toString().search(utils.isRegExp(term) ? term : new RegExp(term, 'i')) < 0;
            } else {
                return !!term;
            }
        },
        regexpSupported: true
    },
    EQ: {
        name: '=',
        func: function(value, term) {
            return value == term;
        },
        regexpSupported: false
    },
    NEQ: {
        name: '<>',
        func: function(value, term) {
            return value != term;
        },
        regexpSupported: false
    },
    GT: {
        name: '>',
        func: function(value, term) {
            return value > term;
        },
        regexpSupported: false
    },
    GTE: {
        name: '>=',
        func: function(value, term) {
            return value >= term;
        },
        regexpSupported: false
    },
    LT: {
        name: '<',
        func: function(value, term) {
            return value < term;
        },
        regexpSupported: false
    },
    LTE: {
        name: '<=',
        func: function(value, term) {
            return value <= term;
        },
        regexpSupported: false
    }
};
 const utils = {
    ALL: '#All#',
    NONE: '#None#',
    BLANK: '#Blank#"',
    expressionFilter : function(operator, term, staticValue, excludeStatic) {
        var self = this;
    
        this.operator = Operators.get(operator);
        this.regexpMode = false;
        this.term = term || null;
        if(this.term && this.operator && this.operator.regexpSupported) {
            if(utils.isRegExp(this.term)) {
                this.regexpMode = true;
                if(!this.term.ignoreCase) {
                    this.term = new RegExp(this.term.source, 'i');
                }
            }
        }
    
        this.staticValue = staticValue;
        this.excludeStatic = excludeStatic;
    
        this.test = function(value) {
            if(Array.isArray(self.staticValue)) {
                var found = self.staticValue.indexOf(value) >= 0;
                return (self.excludeStatic && !found) || (!self.excludeStatic && found);            
            } else if(self.term) {
                return self.operator.func(value, self.term);
            } else if(self.staticValue === true || self.staticValue === utils.ALL) {
                return true;
            } else if(self.staticValue === false || self.staticValue === utils.NONE) {
                return false;
            } else {
                return true;
            }
        };
    
        this.isAlwaysTrue = function() {
            return !(self.term || Array.isArray(self.staticValue) || self.staticValue === utils.NONE || self.staticValue === false);
        };
    },
    defaultOperator : 'MATCH',
    Operators,
    constants : {},
    items : {
        EQ: Operators.EQ.name,
        MATCH : Operators.MATCH.name,
        NOTMATCH : Operators.NOTMATCH.name,
        NEQ : Operators.NEQ.name,
        GT : Operators.GT.name,
        GTE : Operators.GTE.name,
        LT : Operators.LT.name,
        LTE : Operators.LTE.name
    },
    isRegExp: function(obj) {
        return Object.prototype.toString.apply(obj) === '[object RegExp]';
    },
    /**
     * Escapes all RegExp special characters.
     */
     escapeRegex: function(re) {
        return re.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    },
    /**** vérifie si la valeur {value}, match la valeur {filterText} 
     * @param {object : {
     *      value : la valeur à vérifier
     *      filterText : le texte à vérifier si value le match
     *      operateur : chaine de caractère dans la liste des opérateurs :, props Operators, ci-desous
     *      useRegex : Spécifie si l'expression régulière sera utilisée pour la recherche
     * }}
    */
    match : ({value,filterText,operator,useRegex})=>{
        if(isNonNullString(operator)){
            operator = Operators[operator]
        }
        filterText = defaultStr(filterText);
        operator = defaultObj(operator);
        let isSearchMode = filterText !== '';
        if(operator && isFunction(operator.func)){
            let opterm = operator.regexpSupported && isSearchMode ? (useRegex ? filterText : utils.escapeRegex(filterText)) : filterText;
            return !isSearchMode || operator.func(value, opterm)
        }
        return !isSearchMode ? true : defaultStr(value).toLowerCase().contains(filterText.toLowerCase());
    },
    /**
     * Returns the first element in the array that satisfies the given predicate
     * @param  {Array} array     the array to search
     * @param  {function} predicate Function to apply to each element until it returns true
     * @return {Object}           The first object in the array that satisfies the predicate or undefined.
     */
    findInArray: function(array, predicate) {
        if (this.isArray(array) && predicate) {
            for (var i = 0; i < array.length; i++) {
                var item = array[i];
                if (predicate(item)) {
                    return item;
                }
            }
        }
        return undefined;
    },
    /**
     * Returns a JSON string represenation of an object
     * @param {object} obj
     * @return {string}
     */
    jsonStringify: function(obj, censorKeywords) {
        function censor(key, value) {
            return censorKeywords && censorKeywords.indexOf(key) > -1 ? undefined : value;
        }
        return JSON.stringify(obj, censor, 2);
    }
 }
 
for(let i in utils.items){
    utils.constants[i] = i;
}

/*** prend en paramètre un objet de filtres et les prépare pour la requête distante
 * @param {object} filtersToPrepare les filtres à exploiter pour la requête distante 
 * le tableau des filtres 
 * @param {function|object} filter|options, la méthode utilisée pour effectuer un filtre sur les les élément à prendre en compte
 * 
*/
export const prepareFilters = (filtersToPrepare,opts)=>{
    if(typeof opts =='function'){
        opts = {filter:opts};
    }
    let {filter,parseMangoQueries:convMangoQueries} = opts;
    const filters = {}
    filter = typeof filter =='function'? filter : x=>true;
    Object.map(filtersToPrepare,(f,i)=>{
        if(!isObj(f) || !filter(f) || !isNonNullString(f.operator) || !isNonNullString(f.action)) {
            return;
        }
        f.field = defaultStr(f.field,i).trim();
        f.action = defaultStr(f.action).toLowerCase().trim();
        if(f.action =="$today" || f.action == "$yesterday"){
            if(!f.operator){
                f.operator = "$and";
            }
            f.action = "$eq"
        } else if(f.action in  periodActions){
            f.action = "$period";
        }
        filters[f.operator] = defaultArray(filters[f.operator]);
        const ob = {};
        ob[f.field] = {}
        if(f.action == "$period"){
            let sp = defaultStr(f.value);
            if(sp){
                sp = sp.split("=>");
                const isValid1 = DateLib.isValidSQLDate(sp[0]) || DateLib.isValidSQLDateTime(sp[0]);
                const isValid2 = DateLib.isValidSQLDate(sp[1]) || DateLib.isValidSQLDateTime(sp[1]);
                if(isValid1 && isValid2){
                    filters[f.operator].push({
                        [f.field] : {$gte:sp[0]}
                    })
                    filters[f.operator].push({
                        [f.field] : {$lte:sp[1]}
                    })        
                }
            }
        } else if(f.action === "$between"){
            let sp = defaultStr(f.value?.toString());
            if(sp){
                sp = sp.split("=>");
                if(sp.length === 2 && sp[0] && sp[1]){
                    filters[f.operator].push({
                        [f.field] : {$gte:sp[0].trim()}
                    })
                    filters[f.operator].push({
                        [f.field] : {$lte:sp[1].trim()}
                    });
                }
            }
        } else {
            ob[f.field][f.action] = f.value;
            filters[f.operator].push(ob)
        }
    });
    return convMangoQueries ? parseMangoQueries(filters) : filters;
}


export default utils;

const reduceParts = (queries,opts)=>{
    const parts = Array.isArray(queries?.parts)? queries.parts : [];
    if(queries?.parts){
        delete queries.parts;
    }
    return (parts).reduce((prev, curr) => {
        if(Array.isArray(curr?.parts) && curr?.parts?.length){
            curr.operand = reduceParts(curr,opts);
        }
        delete curr.parts;
        const c = whereClauseToSQL(curr,opts);
        return c ? [...prev,c] : prev;
    }, []);
}

/*** convertis les filtres pris au format mangoesQuey, au format de sortie SQL
 * @see : https://github.com/gordonBusyman/mongo-to-sql-converter
 * @param {object} queries, les requêtes au format mango query à convertir au format SQL
 */
export const parseMangoQueries = (queries,opts)=>{
    if(!isObjOrArray(queries)) return [];
    opts = isObj(opts)? opts : {}; 
    return reduceParts(mangoParser.parse(queries),opts)
}
export const getOptimizedOperator = (operator,opts)=>{
    opts = typeof opts =='object' && opts || {};
    if(typeof opts.getDatabaseOperator =="function"){
        const t = opts.getDatabaseOperator(operator);
        if(isNonNullString(t)){
            return t;
        }
    }
    const driver = defaultStr(opts?.driver,opts.dataSourceType).toLowerCase();
    if(operator === "LIKE" && driver.contains("postgres")){
        operator = "ILIKE";
    }
    return operator;
}
export const MANGO_QUERY_OPERATOR = "MANGO_QUERY_OPERATOR";
const whereClauseToSQL = (currentMongoParserElement,opts) => {
    let { field, operator, operand } = currentMongoParserElement;
    if(!isNonNullString(operator)) return null;
    if(!operatorsValuesByKeys[operator]){
        if(!operatorsMap[operator]) {
            return null;
        }
        operator = operatorsMap[operator];
    }
    if(operator == 'LIKE'){
        const deparsed = regexDeparser(operand);
        if(!isObj(deparsed)){
            return null;
        }
        operand = deparsed.value;
        const deparsedOp = deparsed.operator;
        if(deparsedOp =='notcontains'){
            operator = "NOT LIKE";
        }
        if(deparsedOp =='equals'){
            operator = operatorsMap.$eq;
        } else if(deparsedOp =='notequals'){
            operator = operatorsMap.$ne;
        } else{
            const opMap = regexExpressions[deparsedOp];
            if(!opMap || typeof opMap.sql !=='function') return null;
            operand = opMap.sql(operand);
        }
    }
    operator = getOptimizedOperator(operator,opts);
    // AND or OR operators with nested elements
    if (!isNonNullString(field)) {
      // parse nested elements
      const nested = operand.reduce((prev, curr) => {
        const prepared = whereClauseToSQL(curr,opts);
        if(prepared){
            return [...prev,prepared]
        }
        return prev;
      }, []);
      // nested WHERE element
      return {
        //field: MANGO_QUERY_OPERATOR,
        operator,
        operand: nested
      }
    }
    // simple WHERE element
    return {
      field,
      operator,
      operand
    }
  }
  

  // map mongoDB -> SQL operators
const operatorsMap = {
    $or: 'OR',
    $and: 'AND',
    $lt: '<',
    $lte: '<=',
    $gt: '>',
    $gte: '>=',
    $ne: '!=',
    $in: 'IN',
    $nin : 'NOT IN',
    $eq: '=',
    $regex : "LIKE"
  }
  const operatorsValuesByKeys = {};
  for(let i in operatorsMap){
    operatorsValuesByKeys[operatorsMap[i]] = i;
  }
  const statementParamsCounterRef = {current:0};
 /**
 *
 * @param {*} operand
 * @param {*} operator
 * @param {*} field
 * @param {object} statementsParams, les paramètres des statements au cas où on utilisera des requêtes paramétrées
 * Return the operand in right format
 */
  export const getTyppedOperand = (operand, operator, field,statementsParams,fields,opts) => {
    const hasStamentsParms = isObj(statementsParams);
    opts = defaultObj(opts);
    const isInOperator = operator === 'IN' || operator =='NOT IN';
    if(isInOperator){
        operand = Object.toArray(operand);
    }
    const getStatement = ()=>{
        statementParamsCounterRef.current++
        const columnName = field;
        field = getField(field,fields,opts);
        const _field = `${field}_${statementParamsCounterRef.current}`;
        statementsParams[_field] = operand;
        if(isInOperator){
            statementsParams.inOperators = defaultObj(statementsParams.inOperators);
            statementsParams.inOperators[_field] = {field:_field,columnField:field,operator,operand};
        }
        if(typeof opts.getStatementParam =="function"){
            const ff = opts.getStatementParam({...opts,field,isInOperator,_field,statementsParams,columnName,fields,operator,operand});
            if(isNonNullString(ff)) return ff;
        }
        return isInOperator? `(:...${_field})` : `:${_field}`;
    }
    const getFieldCondition = x=>hasStamentsParms ? getStatement() : operand;
    if (typeof operand === 'string') { // wrap strings in double quots
      if(!isNonNullString(field)) return null;
      if(hasStamentsParms){
        return getStatement();
      }
      return escapeSQLQuotes(operand)
    } else if (isInOperator) { // wrap IN arguments in brackers
        if(hasStamentsParms){
            return getStatement();
        }
        operand = operand.map(op => {
            return escapeSQLQuotes(op);
        }).filter(op=>!!op || isNonNullString(op) || typeof op =="number" || typeof op =="boolean");
        const opRand = operand.join(', ');
        return isNonNullString(opRand)? ('(' + opRand + ')') : "";
    } else if (!isNonNullString(field) && Array.isArray(operand)) { // AND or OR elements
      const sqlConditions = operand.map(elem => buildSQLWhereElement(elem,statementsParams,fields,opts)).filter((v)=>isNonNullString(v) && !!v.trim()).join(` ${operator} `)
      return sqlConditions ? `${sqlConditions}` : "";

      return operand.reduce((prev, curr) => {
        const sqlElt = buildSQLWhereElement(curr,statementsParams,fields,opts);
        if(isNonNullString(sqlElt) && sqlElt.trim()){
            prev.push(sqlElt);
        }
        return prev;
      }, []).join(' ' + operator + ' ')
    } else if(isNonNullString(field)) {
        return getFieldCondition();
    }
    return null;
}
  const getField = (field,fields,opts) =>{
     field = defaultStr(field).trim();
     if(!isNonNullString(field)) return "";
     const getF = isObj(opts)? (typeof opts.getDatabaseColumnName ==="function" && opts.getDatabaseColumnName || typeof opts.getField =="function" && opts.getField || null) : null;
     if(getF){
        const t = defaultStr(getF({field,fieldName:field,column:field,fields,columnField:field}));
        if(t) return t;
     }
     if(!(field) || !isObj(fields)) return field;
     const f = fields[field];
     if(isNonNullString(f)) return f.trim();
     if(isObj(f)){
        return defaultStr(f.dabaseColumnName,f.dbColumnName,f.name,field).trim();
     }
     return field;
  }
  
  


  /**
   *
   * @param {*} elem
   * @param {object} statementsParams en cas d'utilisation des requêtes sql avec les statement parameters
   * @param {object} les champs, le mappage des colonnes en bd, à utiliser pour effectuer la requête
   * Return element of WHERE clause
   */
  export const buildSQLWhereElement = (elem,statementsParams,fields,opts) => {
    if(!elem || typeof elem !=='object' || Array.isArray(elem)) return "";
    let { field, operator, operand } = elem;
    if (!isNonNullString(operator)) return "";
    operator = getOptimizedOperator(operator,opts);
    const op = getTyppedOperand(operand, operator, field,statementsParams,fields,opts);
    if(!isNonNullString(op) && typeof op !=='number' && typeof op !=='boolean') return "";
    field = getField(field,fields,opts);
    return isNonNullString(field) ? ((field + ' ' + operator + ' ' +op)) :  ('(' + op + ')');
  }
  
  export const filterDescription = `
  Lorsque plusieurs champs sont filtrés, les filtres sont regroupés en deux groupes :  
  tous les champs filtrés avec l'opérateur [ET] dans le groupe des [ET] et tous les champs filtrés avec l'opérateur [OU] dans le groupe des [OU].
      - Si uniquement 2 champs sont filtrés, l'un avec l'opérateur [OU] et l'autre avec l'opérateur [ET] alors la requête émise sera (conditionChamp1 OU conditionChamp2)
      - Si un seul champ est filtré avec l'opérateur OU et au moins un champ est filtré avec l'opérateur ET, alors la requête sera ((conditionChampsOperateur[ET]1 ET ...conditionChampsOperateur[ET]N) OU (conditionChampOperateur[OU]))
      - Sinon, si plus d'un champ est filtré avec l'opérateur [OU] et au moins un champ avec l'opérateur [ET] la requête sera ((conditionChampsOperateur[ET]1 ET conditionChampsOperateur[ET]2 ... ET conditionChampsOperateur[ET]N) ET (conditionChampsOperateur[OU]1 OU conditionChampsOperateur[OU]2 OU ...conditionChampsOperateur[OU]N)) 
  `
  
  /**** construit une requête SQL d'instructions Where à partir des filtres préparé dans le tableau whereClausePrepared
    Les mangoes queries groupent les requêtes en deux types, les filtres en OR et les filtres en AND. 
    tous les filtres en OR sont mis dans un groupe OR, tous les filtres en AND sont mis dans le groupe AND;
        - Si uniquement 2 champs sont filtrés, l'un en OR et l'autre en AND alors la requête sera (conditionChamp1 OR conditionChamp2)
        - Si au moins 2 champs sont filtrés en OR alors la requête sera ((conditionChampsAnd1 AND conditionChampAnd2, ...conditionChampAndN) AND (conditionsChamps en OR))
        - Si plus d'un champ sont filtrés en OR et au moins un champ est filtré en AND alors la requête sera ((conditionChampsAnd1 AND conditionChampAnd2, ...conditionChampAndN) OR (conditionChamps en OR))
        - Sinon, la requête sera ((conditionChampsAnd1 AND conditionChampAnd2, ...conditionChampAndN) and (conditionsChampOR1 OR conditionsChampO2, ...conditionsChampsOrN))
   * @see : https://github.com/gordonBusyman/mongo-to-sql-converter
   * @parm {array|object} whereClausePrepared, les filtres préparés avec la méthode prepareFilters puis convertis avec la fonction parseMangoQueries
     @param {object} statementsParams, cet objet portera les valeurs des requêtes paremétrées, ces valeurs seront sous forme de : {champ:[operand]}, où les champs seront substitués dans les requêtes
     @param {object} fields les alias aux colonnes
     @param {object} opts {
        allFields {object}, //les champs supplémentaires à prendre en compte pour la récupération du nom du champ en base de données
        getField|getDatabaseColumnName {function({field{string},columnField{string},fields{object}})=><string>}, fonction personnalisée permettant de récupérer le nom du champ en base de données
        getDatabaseOperator {function(operator{string})=><string>}, fonction permettant de personnaliser les opérateurs s'il y a lieu, en fonction du type de rawer ou de nimporte quoi
    }, les options supplémentaires
     @return {string}, la requête Where correspondante
  */
  export const buildSQLWhere = (whereClausePrepared,statementsParams,_fields,opts)=>{
    if(isObj(whereClausePrepared)){
        let isMang = whereClausePrepared.$and || whereClausePrepared.$or;
        if(!isMang){
            for(let i in whereClausePrepared){
                if(isObj(whereClausePrepared[i])){
                    for(let j in operatorsMap){
                        if(j in whereClausePrepared[i]){
                            isMang = true;
                            break;
                        }
                    }
                }
                if(isMang) break;
            }
        }
        if(isMang){
            whereClausePrepared = parseMangoQueries(whereClausePrepared);
        }
    }
    if(!Array.isArray(whereClausePrepared)) return null;
    opts = defaultObj(opts);
    const fields = isObj(opts.allFields)? extendObj({},opts.allFields,_fields) : Object.assign({},_fields);
    statementParamsCounterRef.current = -1;
    statementsParams = isObj(statementsParams) ? statementsParams : null;
    // build WHERE const clause by adding each element of array to it, separated with AND
    const operators = [];
    const cursors = [];
    const results = whereClausePrepared.reduce((prev, curr) => {
       let sqlElt = buildSQLWhereElement(curr,statementsParams,fields,opts);
       if(isNonNullString(sqlElt) && sqlElt.trim()){
            if(Array.isArray(curr?.operand) && isNonNullString(curr?.operator) && ["AND","OR"].includes(curr.operator.toUpperCase())){
                operators.push(curr.operator.toUpperCase());
                cursors.push(curr);
            }
            prev.push(sqlElt);
       }
       return prev;
    }, []);
    if(operators.length){
        if(operators.length == 2 && results.length === 2 && operators[0] !== operators[1]){
            const orIndex = operators[0] === "OR" ? 0 : 1;
            const andIndex = operators.length - orIndex-1;
            const cursorOr = cursors[orIndex];
            if(isObj(cursorOr) && Array.isArray(cursorOr.operand) && cursorOr.operand.length === 1){
                return `(${results[andIndex]}) OR (${results[orIndex]})`
            }
        }
    } 
    return results.join(' AND ');
  }

const sKey = "FILTER-ITEM-KEY";

export const getSessionKey = ()=> defaultStr(getLoggedUserCode())+"-"+sKey;

export const getSessionData = (key)=>{
  const data = defaultObj(session.get(getSessionKey()));
  return isNonNullString(key)? data [key] : data;
}

export const setSessionData = (key,value)=>{
  const data = getSessionData();
  if(isNonNullString(key)){
    data[key] = value;
    return session.set(getSessionKey(),data);
  }
  return false;
}

/*** la liste des actions supportés par les filtres 
 * @see : https://github.com/cloudant/mango from mango query mapping
 *  
*/
//export const actions = ["$lt", "$gt", "$lte", "$gte", "$eq", "$exists", "$type", "$in", "$nin", "$all", "$size", "$or", "$nor", "$not", "$mod", "$regex", "$elemMatch"]

export const actions = {
    get $eq () {return i18n.lang("filter_equals")},
    get $ne () {return i18n.lang("filter_notequals")},
    get $gt () {return i18n.lang("filter_greater_than")},
    get $gte () {return i18n.lang("filter_greater_than_or_equals")},
    get $lt () {return i18n.lang("filter_less_than")},
    get $lte () {return i18n.lang("filter_less_than_or_equals")},
  }
  
export const inActions = {
    get $in () {return i18n.lang("filter_in")}, //Array of JSON values	The document field must exist in the list provided.
    get $nin () {return i18n.lang("filter_not_in")}, //Array of JSON values	The document field not must exist in the list provided.
  }
   
  
export const operators = {
     get $and (){ return i18n.lang("filter_and")}, //Array	Matches if all the selectors in the array match.
     get $or (){return i18n.lang("filter_or")}, //Array	Matches if any of the selectors in the array match. All selectors must use the same index.
}
  
export const periodActions = {
    get $yesterday(){return i18n.lang("filter_yesterday")},
    get $today() {return i18n.lang("filter_today")},
    get $prevWeek(){return i18n.lang("filter_prevWeek")},
    get $week() {return i18n.lang("filter_week")},
    get $month (){return i18n.lang("filter_month");},
    get $period (){return i18n.lang("filter_period");}
}

export const betweenActions = {
    get $between(){return i18n.lang("filter_between")},
}

/**** retourne les options à utiliser pour effectuer une requête fetch
 * 
 */
export const getFetchOptions = (opts,options)=>{
    if(opts && typeof opts =="string"){
        opts = {path:opts};
    }
    opts = extendObj(true,{},opts,options);
    opts.fetchOptions = isObj(opts.fetchOptions) ? Object.clone(opts.fetchOptions) : {};
    if(opts.selector || opts.fetchOptions.where){
        const fOptions = extendObj(opts.fetchOptions,{
            where : extendObj(true,true,defaultArray(opts.selector),defaultArray(opts.fetchOptions.where)),
            fields : defaultVal(opts.fetchOptions.fields,opts.fields),
        });
        const fields = [];
        Object.map(fOptions.fields,(field,f)=>{
            if(isNonNullString(field) && field.trim()){
                fields.push(field.trim());
            } else if(isObj(field)){
                const ff = defaultStr(field.field,f).trim();
                if(ff){
                    fields.push(ff);
                }
            }
        });
        fOptions.fields = fields;
        if(!isObj(fOptions.sort) && isObj(opts.sort) && isNonNullString(opts.sort.column)){
            fOptions.sort = opts.sort;
        }
        if(!fOptions.limit && typeof opts.limit =='number' && opts.limit){
            fOptions.limit = opts.limit;
        } 
        if(!fOptions.page && typeof opts.page =='number' && opts.page){
            fOptions.page = opts.page;
        }
        fOptions.withTotal = defaultBool(fOptions.withTotal,opts.withTotal,true);
        opts.fetchOptions = fOptions;
    }
    return opts;
}