import Dimensions from '$active-platform/dimensions';
import breakpoints, {initBreakPoints} from '../breakpoints';
import {isObj,defaultStr} from "$utils"
import APP from "$app/instance";
import {addClassName,removeClassName,isDOMElement} from "$utils/dom";
import isTouchDevice from "$utils/isTouchDevice";

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

export const isPhoneMedia = () =>{
    if(!isObj(breakpoints.current)) return false;
    let currentMedia = defaultStr(APP.currentMedia,breakpoints.current.name).toLowerCase()
    return  currentMedia == "sp" || currentMedia == "mp" ? true : false;
}

export const isSmallPhoneMedia = () =>{
	if(!isObj(breakpoints.current)) return false;
	let currentMedia = defaultStr(APP.currentMedia,breakpoints.current.name).toLowerCase()
	return currentMedia === "sp";
}
export const isMobileMedia = () =>{
	if(!isObj(breakpoints.current)) return false;
	let currentMedia = defaultStr(APP.currentMedia,breakpoints.current.name).toLowerCase()
	return currentMedia == "mobile" || currentMedia == "xs" || currentMedia == "sp" || currentMedia == "mp"
}
export const isTabletMedia = () => {
	if(!isObj(breakpoints.current)) return false;
	let currentMedia = defaultStr(APP.currentMedia,breakpoints.current.name).toLowerCase();
	return currentMedia === "tablet" || currentMedia == "md" ||  currentMedia == "sm"
}
export const isDesktopMedia = () => {
	if(!isObj(breakpoints.current)) return false;
	let currentMedia = defaultStr(APP.currentMedia,breakpoints.current.name).toLowerCase()
	return currentMedia == "desktop" || currentMedia == "xl" || currentMedia =="lg"
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
}

/**** retourne les dimensions props à exploiter pour le calcul des nouvelles dimensions lorsque la taille de l'écran change
 * 
 */
 export const getDimensionsProps = (dimensions)=>{
    dimensions = isObj(dimensions)? dimensions : {window:Dimensions.get("window"),screen:Dimensions.get("screen")};
    return {
        currentMedia : getCurrentMedia(),
        isMobile : isMobileMedia(),
        isTablet : isTabletMedia(),
        isDesktop : isDesktopMedia(),
        isMobileOrTablet : isMobileOrTabletMedia(),
        isTabletOrDeskTop : isTabletOrDeskTopMedia(),
        isPhone : isPhoneMedia(),
        isSmallPhone : isSmallPhoneMedia(),
        ...dimensions,
    };
}
