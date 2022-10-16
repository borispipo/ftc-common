export default function isDocUpdate (data){
    return isObj(data) && isNonNullString(data._id) ? true : false;
}