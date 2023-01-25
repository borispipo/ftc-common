// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import React from "react";
import PropTypes from "prop-types";
import isDOMElement from "$cutils/dom/isDOMElement";
import defaultStr from "$cutils/defaultStr";
import uniqid from "$cutils/uniqid"
import {isPlainObj,isNonNullString,isObj,isUndefined,debounce} from "$cutils";
import Component from "./Component";
import useIsMounted from "./useIsMounted";
import setRef from "./setRef";
import  isValidElement  from "./isValidElement";
import Dimensions from '$cdimensions';
import {addEventListener,addListener} from "./eventListener";
import useForceRender from "./useForceRender";
import * as isComponents from "./isComponent";
import useStableMemo from "./useStableMemo";
import useMediaQueryUpdateStyle from "./useMediaQueryUpdateStyle";
import {isClientSide} from "$cplatform";
import memoize from "./memoize";
import isEquals from "../compare";
import usePrevious,{usePreviousDifferent} from "./usePrevious";
import getTextContent from "./getTextContent";

React.getTextContent = getTextContent;
React.usePrevious = usePrevious;
React.usePreviousDifferent = usePreviousDifferent;

React.isEquals = React.areEquals = React.compare = isEquals;

export {isEquals};

export {memoize};

export {useMediaQueryUpdateStyle};

export {useStableMemo};

React.useStableMemo = useStableMemo;
React.useMediaQueryUpdateStyle = useMediaQueryUpdateStyle;

export * from "./isComponent";

for(let i in isComponents){
    if(!React[i]){
        React[i] = isComponents[i];
    }
}

React.useForceRender =  useForceRender;

export {useForceRender};

export * from "./eventListener";
React.addEventListener = addEventListener;
React.addListener = addListener;

export {useIsMounted};
React.useIsMounted = useIsMounted;

React.setRef = setRef;

export {isValidElement};
export {Component}
export {setRef};
export {BaseComponent} from "./Component";
export * from "./Component";


export * from "react";


const hasChildren = child => Boolean(child && child.props && child.props.children);
const hasRecursiveChildren = child => hasChildren(child) && typeof child.props.children === 'object';
const isFunction = x => typeof x =="function";
const defaultArray = x => Array.isArray(x) ? x : [];

export const stopEventPropagation = function (e){
    if(isPlainObj(e) && React.isEvent(e.event)){
        e = e.event;
    }
    if(e && typeof e =="object" && e.preventDefault){
        e.preventDefault();
        if(typeof e.stopPropagation =="function") e.stopPropagation();
        e.defaultPrevented = true;
        if(e.nativeEvent && typeof e.nativeEvent.stopImmediatePropagation =="function"){
            e.nativeEvent.stopImmediatePropagation();
        }
        return true;
    }
    return false;
}

export const getKey = (data,index,rowKey)=>{
    if(!isObj(data) && isObj(index)){
        let t = isNonNullString(data)?data : undefined;
        data = index;
        index = t;
    }
    if(isObj(data)){
        if(isNonNullString(rowKey)){
            const vK = typeof data[rowKey];
            if(vK !== 'undefined' && vK !=='object'){
                return data[rowKey];
            }
        }
        let suffix = isNonNullString(data.dbId)? ("-"+data.dbId):"";
        if(isNonNullString(data.rowKey)){
            suffix+=data.rowKey;
        }
        if(isNonNullString(data.key)){
            return data.key+suffix;
        } else if(isNonNullString(data.code)){
            return data.code+suffix;
        }
    }
    if(isNonNullString(index) || typeof(index) ==="number"){
        return index+"";
    }
    return uniqid("key-index-"+uniqid("items-idkml"))
}

const filter = (children, filterFn) => {
  return Children
    .toArray(children)
    .filter(filterFn);
};

export const deepForEach = (children, deepForEachFn) => {
    //if(!Array.isArray(children)) return React;
    React.Children.forEach(children,(child,index) => {
        if (hasRecursiveChildren(child)) {
            // Each inside the child that has children
            deepForEach(child.props.children, deepForEachFn);
        }
        deepForEachFn(child);
    });
    return React;
};
export const onlyText = (children) => {
  
    return React.Children
    .toArray(children)
    .reduce((flattened, child) => [
      ...flattened,
      hasChildren(child) ? onlyText(child.props.children) : child,
    ], [])
    .join('');
};

/*** recherche re */
export const deepFind = (children, deepFindFn) => {
  return children
    .toArray(children)
    .find((child) => {
      if (hasRecursiveChildren(child)) {
        // Find inside the child that has children
        return deepFind(child.props.children, deepFindFn);
      }
      return deepFindFn(child);
    });
};

export const concat = function(){
    var args = Array.prototype.slice.call(arguments,0);
    var jsx = <React.Fragment/>
    for(var i in args){
        jsx = <React.Fragment>{jsx}{args[i]}</React.Fragment>
    }
    return jsx;
}
export const setProps = (ComponentClass,props,result,force) =>{
    if(!isObj(result)) result = {};
    if(!ComponentClass || !isObj(props)) return result;
    let propTypes = {};
    if(isObj(ComponentClass.propTypes)){
        propTypes = ComponentClass.propTypes;
    } else if(ComponentClass.constructor && ComponentClass.constructor.propTypes){
        propTypes = ComponentClass.constructor.propTypes;
    }
    if(!isObj(propTypes)) return force? (Object.size(result,true)>0? result : {...props}) : result;
    for(let t in propTypes){
        if(props.hasOwnProperty(t) && isUndefined(result[t])){
            result[t] = !isUndefined(props[t])? props[t] : result[t];
        }
    } 
    return result;
}
export const extractPropTypes = (propTypes) => {
    let output = {};
    if(!propTypes) return {};
    // copy original PropTypes to AxePropTypes
    Object.keys(ropTypes.PropTypes).forEach(function (propTypeName) {
        if (propTypeName === 'PropTypes') return false;
        output[propTypeName] = PropTypes[propTypeName];
    });
    return output;
}






/**
 *  useDidUpdate hook
 *
 *  Fires a callback on component update
 *  Can take in a list of conditions to fire callback when one of the
 *  conditions changes
 *
 * @param {Function} callback The callback to be called on update
 * @param {Array} conditions The list of variables which trigger update when they are changed
 * @returns {undefined}
 */
export const useDidUpdate = React.useDidUpdate = function useDidUpdate(callback, conditions){
    const hasMountedRef = React.useRef(false);
    if (typeof conditions !== 'undefined' && !Array.isArray(conditions)) {
      conditions = [conditions];
    } else if (Array.isArray(conditions) && conditions.length === 0) {
      console.warn(
        'Using [] as the second argument makes useDidUpdate a noop. The second argument should either be `undefined` or an array of length greater than 0.'
      );
    }
    React.useEffect(() => {
      if (hasMountedRef.current) {
        callback();
      } else {
        hasMountedRef.current = true;
      }
    }, conditions);
}
/**
 * useDidMount hook
 * Calls a function on mount
 *
 * @param {Function} callback Callback function to be called on mount
 */
export const useDidMount = React.useDidMount = function useDidMount(callback) {
    React.useEffect(() => {
        if (typeof callback === 'function') {
            callback();
        }
    }, []);
}
export const useOnRenderTimeout = React.useOnRenderTimeout = 0;
/**
 * useOnRender hook
 * Calls a function on every render
 *
 * @param {Function} callback Callback function to be called on mount
 */
export const useOnRender = React.useOnRender = function useOnRender(callback,timeout) {
    React.useEffect(() => {
        callback = typeof callback =='function'? callback : x=>true;
        setTimeout(callback,typeof timeout =='number'? timeout : React.useOnRenderTimeout);
    });
}

/**
 * useWillUnmount hook
 * Fires a callback just before component unmounts
 *
 * @param {Function} callback Callback to be called before unmount
 */
export const useWillUnmount = React.useWillUnmount = function useWillUnmount(callback) {
    // run only once
    useEffect(() => {
      return callback;
    }, []);
  }
  

export const useStateIfMounted = React.useStateIfMounted = function(initialValue){
    const isMounted = useIsMounted();
    const [state, setState] = React.useState(initialValue);
    function newSetState(value) {
        if (isMounted()) {
          setState(value);
        }
    }
    return [state, newSetState]
}

export default React;

export const isSyntheticEvent = React.isSyntheticEvent = (event)=> {
    if(!event || typeof event !=='object' || !event.constructor || !isNonNullString(event.constructor.name)) return false;
    return event.constructor.name.startsWith('Synthetic') && event.constructor.name.endsWith('Event') ? true : false;
}

export const isEvent = React.isEvent = isSyntheticEvent;

export const AFTER_INTERACTIONS_TIMEOUT = 10;

export function useLatest(value) {
    const ref = React.useRef(value)
    ref.current = value
    return ref
}
  React.useLatest = useLatest;

  export const useEffectAsync = React.useEffectAsync = (operation,deps) => {
    React.useEffect(() => {
        operation().then()
    }, deps)}

React.isComponent = React.isComponent || React.isValidElement;///check if is valid react component    
if(isClientSide()){
    React.Children.deepForEach = deepForEach;
    React.Children.exists = React.Children.has = hasChildren;
    React.Children.onlyText = onlyText;
    React.Children.text = onlyText;
    React.Children.filter = filter;
    React.Children.deepFind = deepFind;
}
if(!React.stopEventPropagation){
    Object.defineProperties(React,{
        isValidElement : {
            value : isValidElement
        },
        deepFind : {value :deepFind},
        concat : {value:concat},
        extractPropTypes : {value:extractPropTypes},
        hasChildren : {value:hasChildren},
        childrenExists : {value:hasRecursiveChildren},
        stopEventPropagation : {
            value : stopEventPropagation,override : false,writable : false
        },
        key : {
            value : getKey,override:false,writable:false
        },
        getKey : {
            value : getKey,
        },
        setProps : {
            value : setProps,override:false,writable:false
        },
        AppComponent : {
            value : Component,
        }
    })
}
//default base component for each element
export const mergeRefs = React.mergeRefs = (...args)=>{
    return function forwardRef(node) {
      args.forEach((ref) => {
        if (ref == null || !ref) {
          return;
        }
        if (typeof ref === 'function') {
          ref(node);
          return;
        }
        if (typeof ref === 'object') {
          ref.current = node;
          return;
        }
        console.error(
          `mergeRefs cannot handle Refs of type boolean, number or string, received ref ${String(
            ref
          )}`
        );
      });
    };
  }

export const useMergeRefs = React.useMergeRefs = (...args) =>{
  return React.useMemo(() => mergeRefs(...args),[...args]);
}


export const updateNativePropsOnDimensionsChanged = React.updateNativePropsOnDimensionsChanged = (hostRef,updateNativePropsCallback,dimensions)=>{
    if(!hostRef || !hostRef.current|| typeof hostRef.current.setNativeProps !=='function') return null;
    const args = Dimensions.getDimensionsProps(dimensions);
    args.target = hostRef.current;
    if(typeof updateNativePropsCallback !== 'function') return args;
    const nProps = updateNativePropsCallback(args,hostRef); 
    if(!isObj(nProps) || !Object.size(nProps,true)) return null;
    return hostRef.current.setNativeProps(nProps);
}

/**** permet de récupérer la fonction à attacher par défaut au listener DimensionChange, pour la mise à jour automatique des props à l'aide de la fonction setNativeProps
 *  * @param updatePropsWithMediaQuery{function}, la fonction permettant de mettre à jour les props lorsque la taille de l'écran change
    * @pram hostRef{func||object}, la référence de l'objet qu'on utilisera pour mettre à jour les props avec la méthode setNativeProps de react-native
    * @param timeout {number}, le délai d'attente à passer à la fonction debounce, pour pouvoir appeler la fonction de mise à jour des props lorsque la taile de l'écran change
    * @return {function||null} la fonction à attacher au listener
 */
export const mediaQueryUpdateNativePropsCallback = React.mediaQueryUpdateNativePropsCallback =  (updatePropsWithMediaQuery,hostRef,timeout)=>{
    if(typeof updatePropsWithMediaQuery !=='function') return null;
    if(typeof hostRef ==='number'){
        const t = timeout;
        timeout = t;
        hostRef = typeof t =='function' || isObj(t)? t : undefined;
    }
    let options = {};
    if(typeof timeout =='object' && timeout){
        options = timeout;
    }
    timeout = typeof timeout =='number'? timeout : typeof options.timeout =='number'? options.timeout : 200;
    return debounce((dimensions)=>{
        return updateNativePropsOnDimensionsChanged(hostRef,updatePropsWithMediaQuery,dimensions);
    },timeout);
}

/*** permet d'attacher un lister sur la modification des props de manière responsive
 *  @return {object{remove:function}||null} l'objet null ou ayan la fonction remove permettant de suprimer le listerner lorsque le composant est démonté
 */
export const getMediaQueryPropsSubscription = React.getMediaQueryPropsSubscription = (updatePropsWithMediaQuery,hostRef,timeout)=>{
    const cb = mediaQueryUpdateNativePropsCallback(updatePropsWithMediaQuery,hostRef,timeout);
    if(!cb) return null;
    return Dimensions.addEventListener("change",cb);
}

/**** 
 * @parm {function}, la fonction de rappel à utiliser pour définir les props à passer à la référence
 * @param {ref}, la référence de l'objet dom auquel on écoutera le changement d'évènement
 * @parm timeout, le délai d'attente lorsque la dimension de l'écran change
 */
 export const useMediaQueryUpdateNativeProps = React.useMediaQueryUpdateNativeProps = (updatePropsWithMediaQuery,ref,timeout)=>{
    const hostRef = React.useRef(null);
    React.useEffect(()=>{
        const subscription = getMediaQueryPropsSubscription(updatePropsWithMediaQuery,hostRef,timeout);
        return () => subscription?.remove();
    },[]);
    return React.useMergeRefs(hostRef,ref);
}

export const useLazyRef = React.useLazyRef = function useLazyRef(callback) {
    const lazyRef = React.useRef();
    if (lazyRef.current === undefined) {
      lazyRef.current = callback();
    }
    return lazyRef;
}

export const useAnimatedValue =  React.useAnimatedValue = function useAnimatedValue(initialValue) {
    //const { current } = useLazyRef(() => new Animated.Value(initialValue));
    //return current;
}

/***** permett de récupérer les arguments onPress, utile pour appeler la fonction onPress des menus */
export const getOnPressArgs = React.getOnPressArgs = (args)=>{
    let event = undefined,rest = {};
    if(React.isEvent(args)){
        event = args;
    } else if(isPlainObj(args)){
        rest = args;
        event = React.isEvent(rest.event);
    }
    React.stopEventPropagation(event);
    return {...rest,event};
}

export const withHooks = React.withHooks = (Component,hooks) => {
    return ({props}) => {
      let hProps = {...props}
      const callCB = (hook)=>{
        if(typeof hook ==='function'){
            const hR = hook(hProps);
            if(isObj(hR)){
               hProps = {...hProps,...hR};
            }
            return hR;
        }
        return false;
      }
      if(isArray(hooks)){
         hooks.map((cb)=>{
            callCB(cb);
         })
      } else if(typeof hooks =='function'){
            callCB(hooks);
      }
      return <Component {...hProps} />;
    };
  };

  export const  useSwipe = React. useSwipe = function useSwipe({onSwipeLeft, onSwipeRight, rangeOffset = 4}) {

    let firstTouch = 0
    
    // set user touch start position
    function onTouchStart(e) {
        firstTouch = e.nativeEvent.pageX
    }

    // when touch ends check for swipe directions
    function onTouchEnd(e){
        const windowWidth = Dimensions.get("window").width;
        // get touch position and screen size
        const positionX = e.nativeEvent.pageX
        const range = windowWidth / rangeOffset
        // check if position is growing positively and has reached specified range
        if(positionX - firstTouch > range){
            onSwipeRight && onSwipeRight({range,event:e})
        }
        // check if position is growing negatively and has reached specified range
        else if(firstTouch - positionX > range){
            onSwipeLeft && onSwipeLeft({range,event:e})
        }
    }

    return {onTouchStart, onTouchEnd};
}

