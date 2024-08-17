// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {isObj,defaultStr,isObjectOrArray,defaultObj,isBool,defaultVal,defaultBool,isNonNullString} from "$cutils";
import SignIn2SignOut,{getLoggedUser,isValidUser,tableDataPerms,structDataPerms,resetPerms,getStructDataPermResourcePrefix,getTableDataPermResourcePrefix,defaultPermsActions} from "../utils";

/*** si l'utilisateur a accès à la permission lorsque la permission est définie via une chaine de caractère
 *  @param permStr{string} : la définition de la permission. 
 *      Elle est définie de la forme :
 *              resource : action où dans un tableau définis comme suit 
 *              [resource1:actions1,resource2:action2,resourceN:actionN]     
 *  Lorsque permStr est un tableau, il est valide lorsque l'utilisateur a accès à l'une des permissions définies dans le tableau    
 *  @param  user {object} l'utilisateur sur qui la permission est vérifié, par défaut l'utilisateur connecté
 *  @param  returnObject {boolean} si un objet est retourné pour chaque permission où tout simplement un boolean
 *      confirmant si  la permission de l'utilisateur satisfait à la demande 
 */
 export const isAllowedFromStr = (permStr,user,returnObject)=>{
    if(isBool(user)){
        returnObject = user;
        user = isObj(returnObject)? returnObject : undefined;
    }
    returnObject = defaultBool(returnObject,false);
    if(!isNonNullString(permStr)){
        if(returnObject){
            return {all:true};
        }
        return true;
    }
    permStr = permStr.toLowerCase().trim();
    let prs = [];
    if(permStr.startsWith('[') && permStr.endsWith(']')){
        let _sp = permStr.split("[")
        var spl = defaultStr(_sp[1]).split(",")
        for (var t in spl){
            let ch = spl[t].replace("]","").toLowerCase();
            if(!arrayValueExists(prs,ch)){
                prs.push(ch);
            }
        }
    } else {
        prs.push(permStr);
    }
    let result = {};
    for(let k in prs){
        if(!isNonNullString(prs[k])) continue;
        let spl = prs[k].toLowerCase().trim().split(":");
        result[k] = isAllowed({user,resource:spl[0],action:(spl[1])})
        if(!returnObject && result[k]){
            return result[k];
        }
    }
    if(!returnObject){
        return false;
    }
    return result;
}

export const isAllowedFromString = isAllowedFromStr;

const checkPSingle = ({user_perm,action})=>{
    if(user_perm == action) return true;
    if(user_perm =="all") return true;
    if(user_perm == "write" && action == "create" || user_perm =="create" && action =="write") return true;
    if(user_perm == "remove" && action == "delete" || user_perm === "delete" && action ==="remove") return true;
    if(user_perm == "update" && action == "edit" || user_perm ==="edit" && action =="update") return true;
    if(action == "read") return true;
    return false;
}
const checkPAction = ({action,user_perm})=>{
    /**** par défaut, toutes les autres permission ont au moins accès en lecture */
    if(action == "read") return true;
    ///les perms sont de la forme read2write2update2delete
    const split = user_perm.split("2");
    const split2 = action.split("|");
    for(let k in split){
        for(let u in split2){
            if(checkPSingle({user_perm:split[k],action:split2[u]}) == true){
                return true;
            }
        }
    }
    return false;
}

/****
 * vérifie si l'utilisateur est autorisé à bénéficier des privilèges associés à la permission
 *  @param  {
 *      perm || permName || resource {string}: le nom/id de la permission/la resource à vérifier,
 *      perms {object}: la liste des permissions de l'utilisateur allouées à l'utilisateur, pour l'application
*       user {object}: l'objet user, portant les informations sur l'utilisateur en question
*       action {string|object}: l'action qu'a l'utilisateur sur la resource à travers la permission
        success : la fonction de rappel, au cas où l'utilisateur a la permission, la fonction de rappel est appélé, 
 *          en passant en paramètre l'action que l'utilisateur peut bénéficier de la permission 
 *  }
 *  L'existance de la permission, impose que l'utilisateur peut bénéficier de la permission, dont peut consulter la fonction liée à la permission. 
 *    perm_actions : {
 *      undefined || read :  l'utilisateur n'a aucune action et se limite juste à consulter,
 *      create || write : L'utilisateur peut créer
 *      edit || update : l'utilisateur peut mettre à jour la resource
 *      delete || remove : L'utilisateur peut supprimer
*       all :  l'utilisateur peut tout faire, 2, l'utilisateur peut créer,modifier,supprimer, 
        la concaténation des permissions se fait avec le chiffre 2 : exemple
            create2edit2delete2update : l'utilisateur peut créer, modifier et supprimer 
    * } 
        L'objet perms : contenant la liste des permissions allouées à l'utilisateur dans l'application est de la forme : 
            perms : {
                resource1 : 'read2create2edit' : les permissions de l'utilsateur sur la resource1, resource1 est de la forme : table/resoureTable où table est la table est le nom d'une table quelconque en base de données
                resource2 : 'create' 
                ...
                resourceN : 'update2delete'
            }
    * @returns {Boolean}
        les actions peuvent être de la forme : 
        action1|action2|action3 signifie que l'une des actions est valide pour la permission.
            exemple action = "read|write|edit|delete" : signifie l'une des actions valide la permission en lecture
        si action est un objet alors, le résultat est un objet, contenant comme clé, la valeur de chaque action
        si la ressource est masterAdmin ou isMasterAdmin, alors l'utilisateur à accès à la permission s'il est masterAdmin uniquement
    */
const checkPerm = ({perms,resource,action}) =>{
    let result = false;
    if(isObjectOrArray(resource)){
        result = {};
        for(let k in resource){
            if(isNonNullString(resource[k])){
                result[resource[k]] = checkPerm({perms,resource:resource[k],action});
            }
        }
        return result;
    }
    if(isObjectOrArray(action)){
        const r2 = {};
        for(let k in action){
            if(isNonNullString(action[k])){
                r2[action[k]] =  checkPerm({perms,resource,action:action[k]});
            }
        }
        return r2;
    }
    if(!isObj(perms) || !isNonNullString(resource) || !isNonNullString(action)) {
        return false;
    }
    resource = resource.trim().toLowerCase();
    const isMasterAdminRessource = resource ==="masteradmin" || resource =='ismasteradmin';
    if(isMasterAdminRessource){
        return SignIn2SignOut.isMasterAdmin();
    }
    const action2resource = `${resource.rtrim("/")}/${action.ltrim("/")}`;
    if(isNonNullString(perms[action2resource]) && perms[action2resource].toLowerCase().split("2").includes("all")){
       return true;
    }
    for (let perm_resource in perms){
        ///la permission qu'a l'utilisateur sur la resource
        const user_perm = defaultStr(perms[perm_resource]).trim().toLowerCase();
        const userPermSplit = user_perm.split("2");
        perm_resource = perm_resource.trim().toLowerCase();
        if(perm_resource == resource){
            let containsAll = user_perm =="all" //|| user_perm.contains("all2") || user_perm.contains("2all")
            action = defaultStr(action,'read').trim().toLowerCase();
            if(containsAll || action =='read' || userPermSplit.includes(action)){
                return true;
            }
            if(checkPAction({action,user_perm})){
                return true;
            } 
        }
    }
    return false;
}
/**** 
 *  vérifie si l'utilisateur est autorisé à manipuler la ressource
 *  @param resource {string|object} : la resource sur laquelle vérifier la permission
 *         la resource peut être un objet de la forme :
 *              { checkouts : 'read2write',companies:'read',users:'create'}
 *  @param action {string} : l'action qu'à l'utilisateur sur la resource
 *  @param success {function} la fonction de rappel en cas de validité de la permission
 *  @param error {function} : la fonction de rappel en cas d'invalidité de la permission
 *  @param perms {object} : la liste des permissions assignées à l'utilisateur : 
 *         objet de la forme : {
 *              resource1 : action1,
 *              resource2 : action2, 
 *              ......
 *              resourceN : actionN
 *          }
 * @param user : {object} : l'objet utilisateur sur le quel vérifier la permission, par défaut l'utilisateur conecté
 */
export const isAllowed = function(args){
    if(isNonNullString(args)){
        args = {resource:args};
    }
    args = defaultObj(args);
    let {perms,action,user,resource,resources} = args;
    let result = true;
    if(!isObj(user)){
        user = defaultObj(getLoggedUser());
        if(!isValidUser(user)){
            if(isObjectOrArray(resource)){
                result = {};
                for(let k in resource){
                    if(isNonNullString(resource[k])){
                        result[resource[k]] = false;
                    }
                }
            }
            return result;
        }
    }
    if(!isObj(perms) || Object.size(perms,true) <= 0 && isObj(user.perms)){
        perms = user.perms;
    }
    //success = defaultFunc(success);
    //error = defaultFunc(error);
    resource = defaultVal(resource,resources);
    if(SignIn2SignOut.isMasterAdmin(user)){
        if(isObjectOrArray(resource)){
            result = {};
            for(let k in resource){
                if(isNonNullString(resource[k])){
                    let r2 = true;
                    if(isObjectOrArray(action)){
                        r2 = {};
                        for(let k in action){
                            if(isNonNullString(action[k])){
                                r2[action[k]] = true;
                            }
                        }
                        r2.read = true;
                    }
                    result[resource[k]] = r2;
                }
            }
        } else {
            let r2 = true;
            if(isObjectOrArray(action)){
                r2 = {};
                for(let k in action){
                    if(isNonNullString(action[k])){
                        r2[action[k]] = true;
                    }
                }
                r2.read = true;
            }
            result = r2;
        }
        //success(result);
        return result;
    }
    return checkPerm({perms,resource,action});
}

/*** vérifie si l'tuilisateur à accès à la structData
 *   @param _table{object|string} : le nom de la table dans la structure de données / objet contenant les informations liée à la vérification de la permission
 *   @param _action {string|object} : l'action qu'à l'utilisateur sur la table de structure de données
     @return {object:{read,create,update,delete}} : les différentes permissions qu'a l'utilisateur sur la table de données
*/
export const isStructDataAllowed = (_table,action,user)=>{
    if(isNonNullString(_table)){
        _table = {
            table : _table
        }
    }
    _table = defaultObj(_table);
    _table.action = defaultVal(_table.action,action,'read');
    user = isObj(_table.user) && Object.size(_table.user,true) && _table.user || user;
    action = _table.action;
    let {table,tableName,resource} = _table;
    tableName = defaultStr(tableName,table);
    const prefix = getStructDataPermResourcePrefix(tableName).trim().rtrim('/');
    resource = defaultStr(resource).trim();
    _table.resource = resource ? `${prefix}/${resource.ltrim(prefix+"/").ltrim("/")}`:prefix;
    if(!Object.size(structDataPerms,true)){
        resetPerms();
    }
    if(isNonNullString(_table.resource)){
        _table.resource = _table.resource.toLowerCase();
        let perm = structDataPerms[_table.resource]
        if(!isObj(perm)){
            perm =  {};
        }
        let p = {}
        if(!perm.read){
            p = {read:false};
        } else {
            p = {...perm};
        }
        if(isObjectOrArray(action)){
            for(let k in action){
                if(isNonNullString(action[k])){
                    const act = action[k].toLowerCase().trim();
                    let b = p[act];
                    if(!isBool(b)){
                        b = isAllowed({resource:_table.resource,user,action:act})
                    }
                    if(!b && !defaultPermsActions.includes(act)){
                        b = isAllowed({resource:`${_table.resource}/${act.ltrim('/')}`,user,action:act});
                    }
                    p[action[k]] = b;
                }
            }
            return p;
        } else {
            action = defaultStr(action,'read').toLowerCase().trim();
            let b = p[action];
            if(!isBool(b)){
                b = isAllowed({resource:_table.resource,user,action})
            }
            if(!b && !defaultPermsActions.includes(action)){
              b = isAllowed({resource:`${_table.resource}/${action.ltrim('/')}`,user,action});
            }
            p[action] = b;
            return p[action] || false;
        }
    } else {
        return structDataPerms;
    }
}

/*** vérifie si l'tuilisateur à accès à la table de données
 *   @param _table{object|string} : le nom de la table dans la structure de données / objet contenant les informations liée à la vérification de la permission
 *   @param _action {string|object} : l'action qu'à l'utilisateur sur la table de structure de données
     @return {object:{read,create,update,delete}} : les différentes permissions qu'a l'utilisateur sur la table de données
*/
export const isTableDataAllowed = (_table,action,user)=>{
    if(isNonNullString(_table)){
        _table = {
            table : _table
        }
    }
    _table = defaultObj(_table);
    _table.action = defaultVal(_table.action,action,'read');
    user = isObj(_table.user) && Object.size(_table.user,true) && _table.user || user;
    action = _table.action;
    let {table,tableName,resource} = _table;
    tableName = defaultStr(tableName,table);
    const prefix = getTableDataPermResourcePrefix(tableName).trim().rtrim('/');
    resource = defaultStr(resource).trim();
    _table.resource = resource ? `${prefix}/${resource.ltrim(prefix+"/").ltrim("/")}`:prefix;
    if(!Object.size(tableDataPerms,true)){
        resetPerms();
    }
    if(isNonNullString(_table.resource)){
        _table.resource = _table.resource.toLowerCase();
        let perm = tableDataPerms[_table.resource]
        if(!isObj(perm)){
            perm =  {};
        }
        let p = {}
        if(!perm.read){
            p = {read:false};
        } else {
            p = perm;
        }
        if(isObjectOrArray(action)){
            for(let k in action){
                if(isNonNullString(action[k])){
                    const act = action[k].toLowerCase().trim();
                    let b = p[act];
                    if(!isBool(b)){
                        b = isAllowed({resource:table.resource,user,action:act})
                    }
                    if(!b && !defaultPermsActions.includes(act)){
                      b = isAllowed({resource:`${_table.resource}/${act.ltrim('/')}`,user,action:act});
                    }
                    p[action[k]] = b;
                }
            }
            return p;
        } else {
            action = defaultStr(action,'read').toLowerCase().trim();
            let b = p[action];
            if(!isBool(b)){
                b = isAllowed({resource:_table.resource,user,action})
            }
            if(!b && !defaultPermsActions.includes(action)){
                b = isAllowed({resource:`${_table.resource}/${action.ltrim('/')}`,user,action});
            }
            p[action] = b;
            return p[action] || false;
        }
    } else {
        return tableDataPerms;
    }
}

export const canManageDataFiles = ()=>{
    return isTableDataAllowed({table:'data',action:'managedatafile'});
}

