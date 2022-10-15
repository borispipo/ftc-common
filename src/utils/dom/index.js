// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import isDElement from "./isDOMElement";
import isNonNullString from "../isNonNullString";
export const isDOMElement = isDElement;
var global = typeof window == "object" && window ? window : typeof global == 'object' && global ? global : {}
  
  /*** get max z-index value */
  export function getMaxZindex()
  {
    let highestZIndex = 0;

    // later, potentially repeatedly
    highestZIndex = Math.max(
      highestZIndex,
      ...Array.from(document.querySelectorAll("body *:not([data-highest]):not(.yetHigher)"), (elem) => parseFloat(getComputedStyle(elem).zIndex))
        .filter((zIndex) => !isNaN(zIndex))
    );
    return highestZIndex;
  }
  
  /*** retrieve viewport elements  of window
   *  retourne les dimensions visibles de l'élement window passé en paramète : 
   *  @return : {w : la largeur de la fenêtre,h : la hauteur de la fenêtre}
  */
  export function getViewportSize(w) {
    // Use the specified window or the current window if no argument
    w = w || window;
    // This works for all browsers except IE8 and before
    if (w.innerWidth != null) return { w: w.innerWidth, h: w.innerHeight };
    // For IE (or any browser) in Standards mode
    var d = w.document;
    if (document.compatMode == "CSS1Compat")
        return { w: d.documentElement.clientWidth,
           h: d.documentElement.clientHeight };
    // For browsers in Quirks mode
    return { w: d.body.clientWidth, h: d.body.clientHeight };
  
  }
  
  /*** get absolute position of an elemnet */
  export function getAbsolutePosition(el) {
    var
        found,
        left = 0,
        top = 0,
        width = 0,
        height = 0,
        offsetBase = getAbsolutePosition.offsetBase;
    if (!offsetBase && document.body) {
        offsetBase = getAbsolutePosition.offsetBase = document.createElement('div');
        offsetBase.style.cssText = 'position:absolute;left:0;top:0';
        document.body.appendChild(offsetBase);
    }
    if (el && el.ownerDocument === document && 'getBoundingClientRect' in el && offsetBase) {
        var boundingRect = el.getBoundingClientRect();
        var baseRect = offsetBase.getBoundingClientRect();
        found = true;
        left = boundingRect.left - baseRect.left;
        top = boundingRect.top - baseRect.top;
        width = boundingRect.right - boundingRect.left;
        height = boundingRect.bottom - boundingRect.top;
    }
    return {
        found: found,
        left: left,
        top: top,
        width: width,
        height: height,
        right: left + width,
        bottom: top + height
    };
  }
  
  
  export function getViewportOffset(element){
    var offset = {"left":0,"top":0};  //keep initial values number so you won't get NaN on first math. operation (on undefined).
  
    for( ; null !== element ; ){
      var style     = undefined
         ,position  = undefined
         ;
  
      offset.left = offset.left + element.offsetLeft;
      offset.top  = offset.top  + element.offsetTop;
  
      try{
        style = self.getComputedStyle(element);
      }catch(err){}
      if("undefined" === typeof style) return offset;      //sometimes we can go up to the document (not document.documentElement a.k.a HTML-tag but the actual document-object - then getComputedStyle will fail.
  
      if(null === element.parentNode)  return offset;      //element is-not contained.
  
      element  = element.parentNode;                      //element is contained. also - that's our "loop++".
      offset.left = offset.left - (element.scrollLeft || 0);  //sometimes scrollLeft is undefined (that will prevent NaN in the offset.left).
      offset.top  = offset.top  - (element.scrollTop  || 0);  //sometimes scrollLeft is undefined (that will prevent NaN in the offset.top).
      
      position = style.getPropertyValue("position");
      if(true === /relative|absolute|fixed/i.test(position)){
        offset.left = offset.left + (Number.parseInt(style.getPropertyValue("border-left-width"), 0) || 0);
        offset.top  = offset.top  + (Number.parseInt(style.getPropertyValue("border-top-width"),  0) || 0);
      }
      
      element = (true === /fixed/i.test(position)) ? null : element.parentNode; //skip going-up more, in-case the element has a fixed position, in-that-case we're done (the loop stop-condition will be activated).
    }
    
    return offset;
  }
  let isDomFullScreen = false;
  /*** put element to fullScreen */
  export function fullscreen(element) {
    try {
      if(!isDOMElement(element)) {
        element = document.body;
      };
      if(element.requestFullscreen)
        element.requestFullscreen();
      else if(element.mozRequestFullScreen)
        element.mozRequestFullScreen();
      else if(element.webkitRequestFullscreen)
        element.webkitRequestFullscreen();
      else if(element.msRequestFullscreen)
        element.msRequestFullscreen();
      isDomFullScreen = true;
    } catch(e){console.log(e," requesting fullscreen")}
  }
  
  export function exitFullscreen() {
    if(!document.activeElement || !isDomFullScreen) return;
    try {
      if(document.exitFullscreen)
      document.exitFullscreen();
    else if(document.mozCancelFullScreen)
      document.mozCancelFullScreen();
    else if(document.webkitExitFullscreen)
      document.webkitExitFullscreen();
    else if(document.msExitFullscreen)
      document.msExitFullscreen();
      isDomFullScreen = false;
    } catch(e){console.log(e," exiting fullscreen")}
  }
  
  // Returns the DOM Node of the element which is in full-screen
  // Returns null if no element in full-screen
  function getCurrentFullScreenElement() {
    return (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement || null);
  }
  
  export function IsFullScreenCurrently() {
    var full_screen_element = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement || null;
    // If no element is in full-screen
    if(full_screen_element === null)
      return false;
    else
      return true;
  }

  export function hasClassName(elem, className) {
    if(!isDOMElement(elem)) return false;
      return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');
  }
  /*** 
   * addClassName(elem,c1,c2,c3)
  */
  export function addClassName() {
      let args = Array.prototype.slice.call(arguments,0);
      let elem = args[0];
      if(!isDOMElement(elem)) return;
      for(let i = 1; i< args.length;i++){
         let className = args[i];
         if(isNonNullString(className) && !hasClassName(elem, className)){
            elem.className += ' ' + className;
         }
      }
  }
  export function removeClassName() {
      let args = Array.prototype.slice.call(arguments,0);
      let elem = args[0];
      if(!elem || !isDOMElement(elem)) return;
      for(let i = 1; i< args.length;i++){
          let className = args[i];
          if(isNonNullString(className) && isNonNullString(elem.className)){
            var reg = new RegExp('(\\s|^)'+className+'(\\s|$)');
            elem.className = elem.className.replace(reg,' ');
            elem.className = elem.className.replace(className,"")
          }
      }
  } 

  Object.defineProperties(global,{
      getMaxZindex : {value:getMaxZindex},
      addClassNameName : {value : addClassName},
      hasClassNameName : {value : hasClassName},
      removeClassNameName : {value : removeClassName},
      fullscreen : {value:fullscreen},
      getViewportSize : {value:getViewportSize},
      getAbsolutePosition:{value:getAbsolutePosition},
      getViewportOffset : {value:getViewportOffset},
      exitFullscreen : {value : exitFullscreen},
      isFullScreenCurrently : {value : IsFullScreenCurrently},
      getCurrentFullScreenElement : {value : getCurrentFullScreenElement}
  })


    /**** retourne les enfants direct du dom element, dont le selector sel est passé en paramètre
     *  @param : elem : l'élément dom dont les enfants seront recherchés
     *  @param : queryDomSelector : le selecteur dom dont les éléments devront match
     *  @param : cb : la fonction de rappel à appeler à chaque élément dom trouvé : cette fonction prend en paramètre l'élément et son index dans la liste
     *  @return : tableau contenant la liste des différents enfants direct de l'élément passé en paramètre
     */
    function getDirectChildren(elem, queryDomSelector,cb){
      if(!isDOMElement(elem) || !isNonNullString(queryDomSelector)) return [];
      if(!(elem.childNodes)) return [];
      let ret = [], i = 0, l = elem.childNodes.length;
      let nodes = elem.childNodes;
      let counterIdx = 0;
      cb = defaultFunc(cb);
      for (i; i < l; ++i){
          if(!isDOMElement(nodes[i])) continue;
          if (nodes[i].matches(queryDomSelector)){
              if(cb.call(nodes[i],nodes[i],counterIdx,i) === false) continue;
              counterIdx++;
              ret.push(nodes[i]);
          }
      }
      return ret;
  }

  if (typeof Element !== 'undefined' && !Element.prototype.matches) {
    Element.prototype.matches = 
        Element.prototype.matchesSelector || 
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector || 
        Element.prototype.oMatchesSelector || 
        Element.prototype.webkitMatchesSelector ||
        function(s) {
          if(!isNonNullString(s)) return false;
          var matches = (this.document || this.ownerDocument).querySelectorAll(s),
              i = matches.length;
          while (--i >= 0 && matches.item(i) !== this) {}
          return i > -1;            
        };

    Element.prototype.getDirectChildren = function(queryDomSelector,cb){
        return getDirectChildren.call(this,queryDomSelector,cb);
    }

    Element.prototype.setMaxZindex = function(){
        let elem = this;
        if(!isDOMElement(elem)) return;
        let zIndex = getMaxZindex();
        elem.style.zIndex = zIndex+"";
    }
  }
  if(typeof Element !== 'undefined' && Element){
     /*** si le dom element a une scroll bar */
    Element.prototype.hasScrollbar = function(type){
        return domElementHasScrollbar(this,type);
    }
  }
  /*** vérifie les scroll bar qu'on un élément dom 
   *  @param element {dom} l'élément à vérifier
   *  @param type {string} le type de barre à vérifier
   * 
  */
  export const domElementHasScrollbar = (elem,type)=>{
      if(!isDOMElement(elem)) return null;
      let sc = {
         horizontal :  elem.scrollWidth > elem.clientWidth,
         vertical : elem.scrollHeight > elem.clientHeight
      }
      type = defaultStr(type).toLowerCase().trim();
      if(type in sc){
          return sc[type];
      }
      return sc;
  }
 
  global.getDomDirectChildren = getDirectChildren;

  export const getScrollParent = global.getScrollParent = global.getParentScroll = (node,includeHidden) => {
    const regex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/; ///(auto|scroll)/;
    if(!isDOMElement(node)) return document.body;
    const parents = (_node, ps) => {
      if (_node.parentNode === null) { return ps; }
      return parents(_node.parentNode, ps.concat([_node]));
    };
  
    const style = (_node, prop) => getComputedStyle(_node, null).getPropertyValue(prop);
    const overflow = _node => style(_node, 'overflow') + style(_node, 'overflow-y') + style(_node, 'overflow-x');
    const scroll = _node => regex.test(overflow(_node));
  
    /* eslint-disable consistent-return */
    const scrollParent = (_node) => {
      if (!(_node instanceof HTMLElement || _node instanceof SVGElement)) {
        return;
      }
  
      const ps = parents(_node.parentNode, []);
  
      for (let i = 0; i < ps.length; i += 1) {
        if (scroll(ps[i])) {
          return ps[i];
        }
      }
  
      return document.scrollingElement || document.documentElement;
    };
  
    return scrollParent(node);
    /* eslint-enable consistent-return */
  };
  export const getParentScroll = getScrollParent;

  export const isNodeList = global.isNodeList = function isNodeList(nodes) {
      var stringRepr = Object.prototype.toString.call(nodes);
      return typeof nodes === 'object' &&
          /^\[object (HTMLCollection|NodeList|Object)\]$/.test(stringRepr) &&
          (typeof nodes.length === 'number') &&
          (nodes.length === 0 || (typeof nodes[0] === "object" && nodes[0].nodeType > 0));
  }

  export const findParentFromNodeList = global.findParentFromNodeList = function(nodeList){
     if(!isNodeList(nodeList)) return null;
     for(let i in nodeList){
        if(isDOMElement(nodeList[i]) && isDOMElement(nodeList[i].parentElement)) return nodeList[i].parentElement;
     }
     return null;
  }

  export const moveDomInputCursorToEnd = global.moveDomInputCursorToEnd = function (inputElt,focus,title) {
      if(!isDOMElement(inputElt)) return;
      setTimeout(function () {
          if (typeof inputElt.selectionStart == "number") {
              inputElt.selectionStart = inputElt.selectionEnd = inputElt.value.length;
          } else if (typeof inputElt.createTextRange != "undefined") {
              var range = inputElt.createTextRange();
              range.collapse(false);
              range.select();
          }
          if(isNonNullString(focus)){
            title = defaultStr(title,focus)
          }
          if(typeof title =="string"){
             inputElt.title = title;
          }
          if(defaultBool(focus,true)){
              inputElt.focus();
          }
      }, 1);
  }