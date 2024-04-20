// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import Dimensions from '$active-platform/dimensions';
import breakpoints, {initBreakPoints} from './breakpoints';
import {useEffect,useState,useRef} from "react";
import {isObj,defaultStr,isNonNullString} from "$cutils"
import APP from "$capp/instance";
import {addClassName,removeClassName,isDOMElement} from "$cutils/dom";
import isTouchDevice from "$cutils/isTouchDevice";
import Keyboard,{isKeyboardVisible} from '$cplatform/keyboard';

export {default as useWindowDimensions} from "$active-platform/useWindowDimensions";

const msp = (dim, limit) => {
    return (dim.scale * dim.width) >= limit || (dim.scale * dim.height) >= limit;
};

export const updateDeviceClassName = ()=>{
	if(typeof document !== 'undefined' && document && isDOMElement(document.body)){
		let b = document.body;
		let deviceKey = "data-device-name";
		let c = b.getAttribute(deviceKey);
		if(c){
			removeClassName(b,c);
		}
		let className = isMobileMedia()? "mobile" : isTabletMedia()? "tablet" : "desktop";
		addClassName(b,className);
		b.setAttribute(deviceKey,className);
		removeClassName(b,"not-touch-device");
		removeClassName(b,"is-touch-device");
		addClassName(b,isTouchDevice()?"is-touch-device":"not-touch-device");
		return className;
	}
	return false;
}

export const smallPhoneBreakpoints = ["sp"];
export const mobileBreakpoints = ["mobile",...smallPhoneBreakpoints,"xs","mp"];
export const phoneBreakpoints = mobileBreakpoints;
export const tabletBreakpoints = ["tablet","md","sm"];;
export const desktopBreakpoints = ["desktop","xl","lg"];
export const isMediaDevice = (alias)=>{
    if(!isObj(breakpoints.current)) return false;
	if(isNonNullString(alias)){
	   alias = alias.trim().toLowerCase().split(",");
	}
	if(!Array.isArray(alias)) return false;
	return alias.includes(defaultStr(APP.currentMedia,breakpoints.current.name).toLowerCase());
}
export const isPhoneMedia = () =>{
    return isMediaDevice(phoneBreakpoints);
}

export const isSmallPhoneMedia = () =>{
	return isMediaDevice(smallPhoneBreakpoints);
}
export const isMobileMedia = () =>{
	return isMediaDevice(mobileBreakpoints) || isMediaDevice(smallPhoneBreakpoints);
}
export const isTabletMedia = () => {
	return isMediaDevice(tabletBreakpoints);
}
export const isDesktopMedia = () => {
	return isMediaDevice(desktopBreakpoints);
}

export const isPortrait = () => {
	const dim = Dimensions.get('screen');
	return dim.height >= dim.width;
}
export const isLandscape = () => {
	const dim = Dimensions.get('screen');
	return dim.width >= dim.height;
}
export const isTablet = () => {
	const dim = Dimensions.get('screen');
	return ((dim.scale < 2 && msp(dim, 1000)) || (dim.scale >= 2 && msp(dim, 1900)));
}
export const isPhone = () => { return !isTablet(); };
export const isMobileOrTabletMedia = () => {
	return isMobileMedia() || isTabletMedia();
}
export const isTabletOrDeskTopMedia = ()=>{
	return isTabletMedia() || isDesktopMedia();
}

export const getScreenSizes = x => Dimensions.get('screen');

export const getWindowSizes = x => Dimensions.get('window');

export const getCurrentMedia = x => breakpoints.getCurrent();

export const getCurrentMediaType = x => isMobileMedia ()? "mobile" : isTabletMedia()? "tablet" : "desktop";

/*screenWidth = Dimensions.get('screen').width,
getSceenWidth = x=>Dimensions.get('screen').width,
screenHeight = Dimensions.get('screen').height,
getScreenHeight = x => Dimensions.get('screen').height*/

if(!isObj(breakpoints.allNormalized)){
    initBreakPoints();
	updateDeviceClassName();
	let mediaTimer = null;
	const updateMedia = ()=>{
		clearTimeout(mediaTimer);
		if(isKeyboardVisible()) {
			console.log("platform dimension keyboard is visible");
			return;
		}
		APP.trigger(APP.EVENTS.RESIZE_PAGE,Dimensions.get("window"))
		updateDeviceClassName();
	}
    Dimensions.addEventListener('change', (e) => {
        const opts = e.window;
        opts.event = e;
        breakpoints.update(opts)
		clearTimeout(mediaTimer);
        mediaTimer = setTimeout(updateMedia,150);
    });
    if(typeof Keyboard.addEventListener =="function"){
        const onKeyboardShow = (event) => {
			keyBoardVisibleRef.current = true;
		}, onKeyboardHide = (event) => {
			keyBoardVisibleRef.current = false;
		};
		Keyboard.addListener('keyboardDidShow', onKeyboardShow);
		DeviceEventEmitter.addListener('keyboardWillShow',onKeyboardShow);
		
		Keyboard.addListener('keyboardDidHide', onKeyboardHide);
		Keyboard.addListener('keyboardWillHide', onKeyboardHide);
    }
}

/**** retourne les dimensions props à exploiter pour le calcul des nouvelles dimensions lorsque la taille de l'écran change
 * 
 */
 export const getDimensionsProps = (dimensions)=>{
    const dim2 = {window:Dimensions.get("window"),screen:Dimensions.get("screen")};
    dimensions = isObj(dimensions)? dimensions : dim2;
    return {
        currentMedia : getCurrentMedia(),
        isMobile : isMobileMedia(),
        isTablet : isTabletMedia(),
        isDesktop : isDesktopMedia(),
        isMobileOrTablet : isMobileOrTabletMedia(),
        isTabletOrDeskTop : isTabletOrDeskTopMedia(),
        isPhone : isPhoneMedia(),
        isSmallPhone : isSmallPhoneMedia(),
        ...dim2.window,
        ...dim2,
        ...dimensions,
    };
}

/****
	hoook permettant de récupérer les dimensions de la page lorsque la fenêtre est redimensionnée
	@param {responsive} boolean, par défaut true, lorsque responsive est à false, alors l'éccoute de l'èvenement de redimensionement est non écouté
*/
export const usePageDimensions = (responsive)=>{
	const [dimensions,setDimensions] = useState(getDimensionsProps());
	responsive = typeof responsive =="boolean"? responsive : true;
	useEffect(()=>{
		const onResize = ()=>{
			setDimensions(getDimensionsProps());
		}
		if(responsive){
			APP.on(APP.EVENTS.RESIZE_PAGE,onResize);
		}
		return ()=>{
			APP.off(APP.EVENTS.RESIZE_PAGE,onResize);
		}
	},[responsive]);
	return dimensions;
}