import {isObj,isNonNullString,defaultObj,defaultNumber} from "$cutils";

/*** permet d'afficher les étiquettes d'impressions 
    @param {string}, le texte à surround
    @param {object
        lineWidth{number} : La longuer de la ligne
        fontSize {number}, la taille de la police
    }, les options : 
*/
export default function outlineText(text,options) {
    if(typeof document == "undefined" || typeof document?.createElement !=='function') return null;
    if(isObj(text)){
        options = text;
        text = defaultStr(options.text);
    } 
    options = defaultObj(options);
    if(!isNonNullString(text)) return null;
    var ctx, canvas = document.createElement('canvas');
    canvas.width = defaultNumber(options.ratio,17)*text.length;
    canvas.height = defaultNumber(options.height,22);
    ctx = canvas.getContext('2d');
    ctx.font = `${defaultNumber(options.fontSize,22)}px Verdana`;
    ctx.lineWidth = defaultNumber(options.lineWidth,1.5);
    let gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop("0", "magenta");
    gradient.addColorStop("0.5", "blue");
    gradient.addColorStop("1.0", "red");
    ctx.strokeStyle = gradient;
    ctx.strokeText(text, 0, 20);
    ctx.restore();
    return canvas.toDataURL();
};