 /**** construit une requête Where à partir des filtres préparé dans le tableau whereClausePrepared
   * @see : https://github.com/gordonBusyman/mongo-to-sql-converter
   * @parm {array} whereClausePrepared, les filtres préparés avec la méthode prepareFilters puis convertis avec la fonction convertToSQL
     @param {bool || object} withStatementsParams si le contenu de la requête utilisera les query builder params
     @param {object} fields les alias aux colonnes
     @return {string}, la requête Where correspondante
  */
 export const buildWhere = (whereClausePrepared,withStatementsParams,fields)=>{
    if(!Array.isArray(whereClausePrepared)) return null;
    statementParamsCounterRef.current = -1;
    const statementsParams = isObj(withStatementsParams) ? withStatementsParams : withStatementsParams ? {} : null;
    // build WHERE const clause by adding each element of array to it, separated with AND
    return whereClausePrepared.reduce((prev, curr) => {
       const bb = buildWhereElement(curr,statementsParams,fields);
       if(bb !== null){
            prev.push(bb);
       }
       return prev;
    }, []).join(' AND ');
  }
      
      /**
       *
       * @param {*} elem
       * @param {object} statementsParams en cas d'utilisation des requêtes sql avec les statement parameters
       * @param {object} les champs, le mappage des colonnes en bd, à utiliser pour effectuer la requête
       * Return element of WHERE clause
       */
      export const buildWhereElement = (elem,statementsParams,fields) => {
        if(!elem || typeof elem !=='object' || Array.isArray(elem)) return "";
        let { field, operator, operand } = elem
        if (!isNonNullString(operator)) return "";
        const op = getTyppedOperand(operand, operator, field,statementsParams,fields);
        if(!isNonNullString(op)) return "";
        field = getField(field,fields);
        return isNonNullString(field) ? ((field + ' ' + operator + ' ' +op)) :  ('(' + op + ')');
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
  export const getTyppedOperand = (operand, operator, field,statementsParams,fields) => {
    const hasStamentsParms = isObj(statementsParams);
    const getStatement = ()=>{
            statementParamsCounterRef.current++
            field = getField(field,fields);
            const _field = field+statementParamsCounterRef.current;
            statementsParams[_field] = oprand;
            return ":{0}".sprintf(_field);
        }
        if (typeof operand === 'string') { // wrap strings in double quots
          if(!isNonNullString(field)) return null;
          if(hasStamentsParms){
            return getStatement();
          }
          return escapeSQLQuotes(operand)
        } else if (operator === 'IN' || operator =='NOT IN') { // wrap IN arguments in brackers
            operand = Object.toArray(operand);
            if(hasStamentsParms){
                return getStatement();
            }
            const oprand = [];
            operand.map(op => {
                oprand.push(escapeSQLQuotes(op));
            });
            const opRand = oprand.join(', ');
            return isNonNullString(opRand)? ('(' + opRand + ')') : "";
        } else if (!isNonNullString(field) && Array.isArray(operand)) { // AND or OR elements
          // recursively call 'buildWhereElement' for nested elements
          // join each element with operator AND or OR
          return operand.reduce((prev, curr) => {
            const bb = buildWhereElement(curr,statementsParams,fields);
            if(bb !== null){
                prev.push(bb);
            }
            return prev;
          }, []).join(' ' + operator + ' ')
        } else if(isNonNullString(field)) {
            return hasStamentsParms ? getStatement() : operand;
        }
        return null;
    }
  const getField = (field,fields) =>{
     field = defaultStr(field).trim();
     if(!(field) || !isObj(fields)) return field;
     const f = fields[field];
     if(isNonNullString(f)) return f.trim();
     if(isObj(f)){
        return defaultStr(f.dabaseColumnName,f.dbColumnName,f.name,field).trim();
     }
     return field;
  }
      
      
      
      
      
      const isNonNullString = x=> x && typeof x =='string';