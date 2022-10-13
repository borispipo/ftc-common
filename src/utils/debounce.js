
export default function debounce(func, wait, immediate,context) {
    let timeout;
    return function executedFunction() {
      context = context || this;
      const args = Array.prototype.slice.call(arguments,0);        
      const later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };
  