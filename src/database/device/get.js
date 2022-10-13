import session from "$session"
import { sessionName } from "./utils";

/***permet de récupérer la valeur du divice */
export default function getDeviceName(){
    return defaultStr(session.get(sessionName),APP.DEVICE.computerName);
};
