import {showPrompt} from "$components/Dialog/confirm";
import notify from "$notify";
import {isMobileNative} from "$platform";
import { sessionName } from "./utils";
import session from "$session";

export default function setDeviceName(){
    return showPrompt({
        title : 'ID unique pour l\'appareil',
        text : get(),
        yes : 'Définir',
        placeholder : isMobileNative()? "":'Entrer une valeur unique sans espace SVP',
        no : 'Annuler',
        onSuccess : ({value})=>{
            if(!value || value.contains(" ")){
                notify.error("Merci d'entrer une valeur non nulle ne contenant pas d'espace");
                return false;
            }
            if(value.length > 20){
                notify.error("la valeur entrée doit avoir au plus 20 caractères");
                return false;
            }
            session.set(sessionName,value);
            notify.success("la valeur ["+value+"] a été définie comme identifiant unique pour l'application instalée sur cet appareil");
            return;
        }
    })
} 