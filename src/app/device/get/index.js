import session from "$session"
import { sessionName } from "../utils";
import defaultStr from "$cutils/defaultStr";

/***permet de récupérer la valeur du divice */
export default function getDeviceId(){
    return defaultStr(session.get(sessionName));
};
