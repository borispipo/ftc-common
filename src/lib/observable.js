// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

export const observable = function(el) { 
  if(isObservable(el)) return el; ///avoid redefine observable
  /**
   * Extend the original object or create a new empty one
   * @type { Object }
   */

  el = el || {}

  /**
   * Private variables
   */
  let callbacks = {},finallyCallback = {},
    slice = Array.prototype.slice

  /**
   * Public Api
   */
  el._____isObservable = true;
  // extend the el object adding the observable methods
  Object.defineProperties(el, {
    /**
     * Listen to the given `event` ands
     * execute the `callback` each time an event is triggered.
     * @param  { String } event - event id
     * @param  { Function } fn - callback function
     * @returns { Object } el
     */
    on: {
      value: function(event, fn,priority) {
        if (typeof fn == 'function' && event && typeof event ==='string')  {
            (callbacks[event] = callbacks[event] || []).push(fn);
        }
        return el
      },
      enumerable: false,
      writable: false,
      configurable: false
    },
    finally : {
        value: function(event, fn) {
        if (typeof fn == 'function')
          (finallyCallback [event] = finallyCallback[event] || []).push(fn)
        return el
      },
      enumerable: false,
      writable: false,
      configurable: false
    },

    /**
     * Removes the given `event` listeners
     * @param   { String } event - event id; if event is null, all callback will be removed
     * @param   { Function } fn - callback function
     * @returns { Object } el
     */
    off: {
      value: function(event, fn) {
        if(!(event) || typeof event !=='string') return this;
        if (event == '*' && !fn) callbacks = {}
        else {
          if (fn) {
            var arr = callbacks[event]
            for (var i = 0, cb; cb = arr && arr[i]; ++i) {
              if (cb == fn ) {
                  arr.splice(i--, 1)
              }
            }
          } else {
            console.warn("observable, call off on event "+event+" with invalid function "+fn);
            //else delete callbacks[event], le bug qui supprime le callback des évènemenmts lorsque fn est à undefined
          }
        }
        return el
      },
      enumerable: false,
      writable: false,
      configurable: false
    },
    offAll : {
        value : function(){
            MS_OBSERVER.removeObserver(this);
            callbacks = {};
            finallyCallback = {};
        },
        enumerable: false,
        writable: false,
        configurable: false
    },

    /**
     * Listen to the given `event` and
     * execute the `callback` at most once
     * @param   { String } event - event id
     * @param   { Function } fn - callback function
     * @returns { Object } el
     */
    one: {
      value: function(event, fn) {
        function on() {
          el.off(event, on)
          fn.apply(el, arguments)
        }
        return el.on(event, on)
      },
      enumerable: false,
      writable: false,
      configurable: false
    },

    /**
     * Execute all callback functions that listen to
     * the given `event`. if the last argument is function then il will be considered as the
     * final callback function to be execute after alls callbacks'execution (
     * Exemeple : obj.trigger(even,arg1,arg2,...argN,function(){
     *    code will be execute after event executed
     * Le callback d'execution prend en parmètre le résultat de l'execution de tous les trigger comme paramètre 
     * et l'ensemble des arguments passé en paramètres à tous ces triggers
     * Si ce paramètre n'admet pas d'arguments, alors auccun trigger n'a été trouvé dans l'observateur
     * 
     * })
     * @param   { String } event - event id
     * @returns { Object } el
     */
    trigger: {
      value: function(event,...args) {
          if(typeof event !== "string" || !event) return;
          // getting the arguments
          let  fns,fn,i;
          let finaly = null;
          if(typeof args[args.length-1] == 'function'){
              finaly = args.pop();
          } 
          fns = slice.call(callbacks[event] || [], 0);
          let fnsReturns = [];
          for (i = 0; fn = fns[i]; ++i) {
              if(typeof fn === 'function') {
                fnsReturns.push(fn.apply(el, args));
              }
          }
          if (callbacks['*'] && event != '*'){
              el.trigger.apply(el, ['*', event].concat(args));
          }
          //finaly events callback
          var finalCals = slice.call(finallyCallback[event] || [],0);
          // le premier paramètres, représente un tableau des différents résultats retournés par les écouteurs de l'évènemet
          // Le deuxième paramètre est le tableau contenant toute la liste de tous les arguments qui ont été passés à la fonction trigger
          for (i = 0; fn = finalCals[i]; ++i) {
              fn.call(el, fnsReturns,args)
          }
          //le callback de fin d'exécution de l'évènement trigger, prend en paramètres:
          // le premier paramètres, représente un tableau des différents résultats retournés par les écouteurs de l'évènemet
          // Le deuxième paramètre est le tableau contenant toute la liste de tous les arguments qui ont été passés à la fonction trigger
          if(finaly){
              finaly.call(el,fnsReturns,args);
          }
          return el
      },
      enumerable: false,
      writable: false,
      configurable: false
    }
  });
  return el
}
var MS_OBSERVER = typeof window !="undefined" && typeof ___MS_ALL_OBSERVER_VAR ==='object' && typeof ___MS_ALL_OBSERVER_VAR !=='undefined' ? ___MS_ALL_OBSERVER_VAR : {}
const isFunction = x => typeof x =="function";
if(MS_OBSERVER && isFunction(MS_OBSERVER.add) && isFunction(MS_OBSERVER.removeObserver) && isFunction(MS_OBSERVER.reset)){

} else MS_OBSERVER = {
    _stores: [],
    add: function(store) {
      try {if(store._____isObserver === true) return;store._____isObserver = true;} catch(e){}
      MS_OBSERVER._stores.push(store);
    },
    removeObserver : function(store){
        var newStore = [];
        for(var i in MS_OBSERVER._stores){
          if(MS_OBSERVER._stores[i] ===store){
              continue;
          } else {
            newStore.push(MS_OBSERVER._stores[i])
          }
        }
        delete MS_OBSERVER._stores;
        MS_OBSERVER._stores = newStore;
    },
    reset: function() {
      MS_OBSERVER._stores = [];
    }
    
};
export const addObserver = MS_OBSERVER.add;
  const removeObserver =  MS_OBSERVER.remove;
  ['on','one','off','trigger'].forEach(function(api){
    MS_OBSERVER[api] = function() {
      var args = [].slice.call(arguments);
      this._stores.forEach(function(el){
        el[api].apply(el, args);
      });
    };
  });

export const isObservable = MS_OBSERVER.isObservable = function(obj){
      if(obj  == undefined | typeof obj != 'object') obj = this;
      if(obj == false | obj == null) return false;
      if(typeof jQuery === 'object' && obj instanceof jQuery) return true;
      return (obj._____isObservable === true) && typeof(obj.on === 'function');
}

export const isObserver = MS_OBSERVER.isObserver = function (obj){
      if(obj  == undefined | typeof obj != 'object') obj = this;
      if(obj == false | obj == null) return false;
      if(typeof jQuery === 'object' && obj instanceof jQuery) return true;
      return (obj._____isObserver === true);
  }
  if(!MS_OBSERVER.isObservable(MS_OBSERVER)) {
      MS_OBSERVER.add(new function(){
          observable(this);
      });
  }

if(typeof window =="object" && typeof window !=='undefined'){
  if(!window.observable && !window.addObserver){
    Object.defineProperties(window,{
        addObserver : {
           writable : false,
           value : addObserver
        },
        isObserver : {
          value : isObservable,
          override : false,writable : false
        },
        isObservable : {
           writable : false,
           value : isObservable
        },
        observable : {
           writable : false,
           value : observable,
           override : false
        },
        removeObserver : {
          writable : false,
          value : removeObserver,
          override:false,
        },
        observer : {
           value : MS_OBSERVER,
           writable : false,
           override : false
        },
        MS_OBSERVER : {
          writable : false,
          value : MS_OBSERVER
        }
    })
   // console.log("has defined ",window.removeObserver)
  }
  window.___MS_ALL_OBSERVER_VAR = MS_OBSERVER;
}

MS_OBSERVER.observable = observable;

export default MS_OBSERVER;