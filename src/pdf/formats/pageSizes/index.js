import iso from "./iso";
import all from "./all";

export default {
    iso,
    all,
    converter : ({size,from,to})=>{
        size= defaultDecimal(size);
        from = defaultStr(from).toLowerCase();
        to = defaultStr(to).toLowerCase()
        let ratio = 1;
        if(from == 'pt' || from == 'points'){
            if(to == "in" || to == "inches"){
               // ratio = 
            }
        }
    }
}
export {iso,all}