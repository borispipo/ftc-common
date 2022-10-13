import isNonNullString from "./isNonNullString";
/*** cette fonction prend en paramètre une chaine de caractère et échape certains motifs  
 *  les motifs à remplacer sont de la forme : {motif}, mis entre crochet
 *  exemple le motif {date} : est remplacé par la date courante dans la chaine de caractère
 *  sprintf("Lundi je serais à midi à {time}") => Lundi je serais à midi 14:55:22 si l'heure courante c'est 14h 55 min 22 seconde 
 * 
*/
export default function sprintf(string,patterns){
    if(!isNonNullString(string)) return "";
    const _partterns = extendObj({},{
        ///la date actuelle à remplacer dans une chaine de caractère
     '&date&' : (str) => new Date().format("dd/mm/yyyy"),
     '&heure&' : (str) => new Date().format("HH:MM:ss"),  
     '&dateheure&' :  dateTime,
    },patterns);
    Object.map(_partterns,(p,i)=>{
         let idx = i;
         let val = isFunction(p)? p(string,i): p;
         if(typeof val == 'string') string = string.replaceAll(idx,val).replaceAll(idx.toUpperCase(),val);
    })
    return string;
 }

 const dateTime = (str)=> new Date().format("dd/mm/yyyy HH:MM:ss");