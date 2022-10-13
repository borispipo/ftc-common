import Dimensions from '$active-platform/dimensions';
import {isObj,defaultObj,extendObj} from "$utils";

export const breakpoints = {
    all: {
        sp:320,
        mp:399,
        xs:575, // Small devices (landscape phones, 576px and up)
        sm:767,// Medium devices (tablets, 768px and up)
        md : 1120,
        md : 1024,
        lg:1199, // Extra large devices (large desktops, 1200px and up)
        xl:999999999999999
    }
}

// int comparer for sorts
var compareInts = function compare(a, b) {
    if (a < b) {
        return -1;
    }

    if (a > b) {
        return 1;
    }

    return 0;
};

// Indicates if an object is numeric
var isNumeric = function (obj) {
    return !isNaN(parseFloat(obj)) && isFinite(obj);
};

// Given a breakpoints object, will convert simple "max" values to a rich breakpoint object
// which can contain min, max, and name
const setMaxWidths = function (breakpoints) {
    var maxWidths = [];
    for (let name in breakpoints) {
        var breakpoint = breakpoints[name];

        if (isNumeric(breakpoint)) {
            var max = parseInt(breakpoint, 10);
            breakpoint = {
                max: max
            };

            breakpoints[name] = breakpoint;
        } else if (breakpoint.hasOwnProperty("max")) {
            breakpoints.max = parseInt(breakpoints.max, 10);
        } else {
            //throw new Error("No max specified for breakpoint: " + name);
        }

        breakpoint.name = name;

        maxWidths.push(breakpoint.max);
    }

    maxWidths.sort(compareInts);

    return maxWidths;
};

// Given a breakpoints object, will assign "min" values based on the
// existing breakpoints "max" values.
const setMinWidths = function (breakpoints, maxWidths) {
    for (let name in breakpoints) {
        var breakpoint = breakpoints[name];

        if (breakpoint.hasOwnProperty("min")) {
            continue;
        }

        for (var i = 0; i < maxWidths.length; i++) {
            if (breakpoint.max == maxWidths[i]) {
                if (i === 0) {
                    breakpoint.min = 0;
                } else {
                    breakpoint.min = maxWidths[i - 1] + 1;
                }
                break;
            }
        }
    }
};

// Given a breakpoints object, will create a "max" breakpoint
// going from the largest breakpoint's max value to infinity
const addMaxBreakpoint = function (breakpoints, maxWidths) {
    if (!maxWidths || maxWidths.length === 0) {
        return;
    }
    var largestBreakpoint = maxWidths[maxWidths.length - 1];
    if(!isNumeric(largestBreakpoint)) return;
    breakpoints.max = {
        min: largestBreakpoint + 1,
        max: Infinity
    };
};


// Given a raw breakpoints object (with simple ints for max values), 
// converts to a fully normalized breakpoints object with breakpoint objects for values.
const normalize = function (breakpoints) {
    // Normalize the breakpoints object
    var maxWidths = setMaxWidths(breakpoints);
    setMinWidths(breakpoints, maxWidths);
    addMaxBreakpoint(breakpoints, maxWidths);
};

const setCurrentMediaName = (name)=>{
    breakpoints.current.name = name;
    if(typeof window !=="undefined" && window && isObj(window.APP)){
        APP.currentMedia = breakpoints.current.name = name;
    }
}

export const update = breakpoints.update = function(opts){
    let _breakpoints = defaultObj(breakpoints.allNormalized);
    opts = defaultObj(opts)
    const width = isNumeric(opts.width) ? opts.width : Dimensions.get('window').width; // Window width
    if (width === 0) {
        return;
    }
    for (let name in _breakpoints) {
        var breakpoint = _breakpoints[name];
        if(!isObj(breakpoint)) continue;
        // Detect which breakpoints have been entered and which ones have been left.
        if (width <= breakpoint.max && width >= breakpoint.min) {
            breakpoints.current = breakpoint;
            setCurrentMediaName(name);
            return name;
        }
    }
}


export function initBreakPoints(force){
    if(isObj(breakpoints.allNormalized) && force !== true ){
        return;
    }
    const width = Dimensions.get('window').width;
    let _bp = extendObj({},breakpoints.all);
    normalize(_bp);
    for (let name in _bp) {
        var breakpoint = _bp[name];
        if(!isObj(breakpoint)) continue;
        if (width <= breakpoint.max && width >= breakpoint.min) {
            breakpoints.current = breakpoint;
            setCurrentMediaName(name);
            break;
        } 
    }
    breakpoints.allNormalized = _bp;
}

/*** retourne le medié courant à partir de la width passée en paramètre
 * @param {number}, la valeur de la taille du window dont on veut retourner le media
 */

export const getCurrentMedia = breakpoints.getCurrentMedia = (width)=>{
    width = typeof width ==='number' && width > 300 ? width : Dimensions.get("window");
    for(let i in breakpoints.all){
        if(width <= breakpoints.all[i]) return i;
    }
    return breakpoints.current?.name || "";
}

/*** retourne le media query en cours 
 * sans toutefois à chaque fois 
*/
export const getCurrent = breakpoints.getCurrent = ()=>{
    return breakpoints.current?.name ? breakpoints.current?.name : getCurrentMedia();
}

export default breakpoints;