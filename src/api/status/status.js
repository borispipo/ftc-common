/***@see : https://www.restapitutorial.com/httpstatuscodes.html. 
 * or @see : https://developer.mozilla.org/fr/docs/Web/HTTP/Status#r%C3%A9ponses_derreur_c%C3%B4t%C3%A9_client
*/


export const SUCCESS = 200;

export const CREATED = 201;

export const ACCEPTED = 202;

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