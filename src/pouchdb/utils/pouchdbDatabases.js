const databasesRef = {current:{}};

export const get = () =>{
    return databasesRef.current;
}

export const set = (databases) =>{
    if(typeof databases =='object' && databases){
        databasesRef.current = databases;
    }
    return databasesRef.current;
}

export default {
    get,set
};