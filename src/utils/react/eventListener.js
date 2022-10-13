  export function addEventListener(Module, ...rest) {
    const [eventName, handler] = rest;
  
    let removed = false;
  
    const subscription = Module.addEventListener(eventName, handler) ?? {
      remove: () => {
        if (removed) {
          return;
        }
  
        Module.removeEventListener(eventName, handler);
        removed = true;
      },
    };
  
    return subscription;
  }
  
  export function addListener(Module, ...rest) {
    const [eventName, handler] = rest;
  
    let removed = false;
  
    const subscription = Module.addListener(eventName, handler) ?? {
      remove: () => {
        if (removed) {
          return;
        }
  
        Module.removeEventListener(eventName, handler);
        removed = true;
      },
    };
  
    return subscription;
  }