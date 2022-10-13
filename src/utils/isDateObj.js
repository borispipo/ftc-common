export default function isDateObj(dateObj){
    if(!dateObj) return false;
	if(dateObj instanceof Date) return true;
    if(typeof dateObj.getTime != 'function') return false;
    return !(Object.prototype.toString.call(dateObj) !== '[object Date]' || isNaN(dateObj.getTime()));
}