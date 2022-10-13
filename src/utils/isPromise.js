function isNativePromise(p) {
    if(typeof p ==='boolean' || !p) return false;
    if(Object(p).constructor === Promise) return true;
    if(p.constructor && (p.constructor.name === 'Promise' || p.constructor.name === 'AsyncFunction')) return true;
    if(p instanceof Promise) return true;
    return p && typeof p.constructor === "function"
      && Function.prototype.toString.call(p.constructor).replace(/\(.*\)/, "()")
      === Function.prototype.toString.call(Function)
        .replace("Function", "Promise") // replacing Identifier
        .replace(/\(.*\)/, "()"); // removing possible FormalParameterList 
    return !!p && (typeof p === 'object' || typeof p === 'function') && typeof p.then === 'function' && typeof p.finally =='function' && typeof p.catch =='function' ? true : false;
  }

  export default function isPromise(value) {
    return value && Object.prototype.toString.call(value) === "[object Promise]" ? true : isNativePromise(value);
}