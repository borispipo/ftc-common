import session from "$session"
import { sessionName } from "./utils";
import APP from "$capp/instance";

/***permet de récupérer la valeur du divice */
export default function getDeviceName(){
    return defaultStr(session.get(sessionName),APP.DEVICE.computerName);
};
