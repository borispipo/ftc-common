
import { isPlainObj } from "$cutils/extendObj";

/***@see : https://www.restapitutorial.com/httpstatuscodes.html. 
 * or @see : https://developer.mozilla.org/fr/docs/Web/HTTP/Status#r%C3%A9ponses_derreur_c%C3%B4t%C3%A9_client
        @see : https://restfulapi.net/http-status-codes/
*/

/***
    Indicates that the request has succeeded.
*/
export const SUCCESS = 200;

/***
    Indicates that the request has succeeded and a new resource has been created as a result.
*/
export const CREATED = 201;

/***
    Indicates that the request has been received but not completed yet. It is typically used in log running requests and batch processing.
*/
export const ACCEPTED = 202;

/***
    Indicates that the returned metainformation in the entity-header is not the definitive set as available from the origin server, but is gathered from a local or a third-party copy. The set presented MAY be a subset or superset of the original version.
*/
export const NON_AUTHORITATIVE_INFORMATION = 203;

/**
 * The server has fulfilled the request but does not need to return a response body. The server may return the updated meta information.
 */
export const NO_CONTENT = 204;

/***
    Indicates the client to reset the document which sent this request.
*/
export const RESET_CONTENT = 205;

/***
    It is used when the Range header is sent from the client to request only part of a resource.
*/
export const PARTIAL_CONTENT = 206;

/***
    An indicator to a client that multiple operations happened, and that the status for each operation can be found in the body of the response.
*/
export const MULTI_STATUS = 207;

/***
    Allows a client to tell the server that the same resource (with the same binding) was mentioned earlier. It never appears as a true HTTP response code in the status line, and only appears in bodies.
*/
export const ALREADY_REPORTED = 208;

/**
 * The server has fulfilled a GET request for the resource, and the response is a representation of the result of one or more instance-manipulations applied to the current instance.
 */
export const IM_USED = 226;

export const SUCCESS_STATUTES = [SUCCESS,CREATED,ACCEPTED,NON_AUTHORITATIVE_INFORMATION,NO_CONTENT,RESET_CONTENT,PARTIAL_CONTENT,MULTI_STATUS,ALREADY_REPORTED,IM_USED];

export const INTERNAL_SERVER_ERROR = 500;

export const SERVICE_UNAVAILABLE = 503;


////400 errors, client side
///Cette réponse indique que le serveur n'a pas pu comprendre la requête à cause d'une syntaxe invalide.
export const BAD_REQUEST = 400;

///Bien que le standard HTTP indique « non-autorisé », la sémantique de cette réponse correspond à « non-authentifié » : le client doit s'authentifier afin d'obtenir la réponse demandée.
export const NOT_SIGNED_IN = 401;
export const UNAUTHORIZED = 401;
export const NOT_LOGGED_IN = NOT_SIGNED_IN;

///Ce code de réponse est réservé à une utilisation future. Le but initial justifiant la création de ce code était l'utilisation de systèmes de paiement numérique. Cependant, il n'est pas utilisé actuellement et aucune convention standard n'existe à ce sujet.
export const PAYMENT_REQUIRED = 402;

///Le client n'a pas les droits d'accès au contenu, donc le serveur refuse de donner la véritable réponse.
export const FORBIDEN = 403;
//Le serveur n'a pas trouvé la ressource demandée. Ce code de réponse est principalement connu pour son apparition fréquente sur le web.
export const NOT_FOUND = 404;

///La méthode de la requête est connue du serveur mais n'est pas prise en charge pour la ressource cible. Par exemple, une API peut ne pas autoriser l'utilisation du verbe DELETE pour supprimer une ressource.
export const METHOD_NOT_ALLOWED = 405;

///Cette réponse est envoyée quand le serveur web, après une négociation de contenu géré par le serveur, ne trouve rien qui satisfasse les critères donnés par l'agent utilisateur.
export const NOT_ACCEPTABLE = 406;


const checkIfIsSuccessStatus = (status)=>{
    if(typeof status =="string") {
        status = parseInt(status);
        if(status === NaN) return false;
    }
    if(typeof status != 'number') return false;
    return SUCCESS_STATUTES.includes(status);
}
/***
    détermine si le paramètre passé à la fonction est un résultat success
    @param {Any} status, 
*/
export function isSuccessStatus (status){
    if(isPlainObj(status)){
        if(checkIfIsSuccessStatus(status.status)) return true;
        if(isPlainObj(status.fetchResponse)) {
            return checkIfIsSuccessStatus(status.fetchResponse.status);
        } else if(isPlainObj(status.response)){
            return checkIfIsSuccessStatus(status.response.status);
        }
    }
    return checkIfIsSuccessStatus(status);
}