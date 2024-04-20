/****
    retourne l'objet global à l'application en fonction de la plateforme
*/
const gbl = (function() {
    if (typeof window !== 'undefined' && typeof window ==="object") { return window; }
    if (typeof self !== 'undefined' && typeof self ==="object") { return self; }
    if (typeof global !== 'undefined' && typeof global ==="object") { return global; }
    if (typeof globalThis !== 'undefined' && typeof globalThis ==="object") { return globalThis; }
   return {};
})();

export default gbl;