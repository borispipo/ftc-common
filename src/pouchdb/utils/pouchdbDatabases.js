let __POUCHDBDatabases = {};

export const get = () =>{
    return __POUCHDBDatabases;
}

export const set = (databases) =>{
    if(typeof databases =='object' && databases){
        __POUCHDBDatabases = databases;
    }
    return __POUCHDBDatabases;
}

export default {
    get,set
};