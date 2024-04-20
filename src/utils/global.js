/****
    retourne l'objet global à l'application en fonction de la plateforme
*/
const gbl = (function() {
    if (typeof self !== 'undefined' && typeof self ==="object") { return self; }
    if (typeof window !== 'undefined' && typeof window ==="object") { return window; }
    if (typeof global !== 'undefined' && typeof global ==="object") { return global; }
   return {};
})();

export default gbl;