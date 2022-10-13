import Dimensions, {useWindowDimensions} from '$dimensions';
import breakpoints from "$platform/breakpoints";
import {isNumber,parseDecimal,defaultStr,isFunction,isNonNullString,defaultVal,isObj,defaultObj} from "$utils";
import {canBeNumber} from "./utils";

let colWidth = 100 / 12;
export const medias = {
    sp:3,//maxWidth = 320
    mp:4, //maxWidth = 399
    xs :5,//575, // Small devices (landscape phones, 576px and up)
    sm:6,//767,// Medium devices (tablets, 768px and up)
    md:7,//1024,,
    lg:8,//1199, // Extra large devices (large desktops, 1200px and up)
}

export const mediaQueries = "col-4 phone-12 tablet-6 desktop-4";

function rowCol(width,update){
    const winWidth = Dimensions.get("window").width;
    const hasWidth = isNumber(width) && Math.abs(width-winWidth)>10 && width > MIN_WIDTH?true : false;
    width = hasWidth ? width : winWidth;
    if(update === true){
        breakpoints.update();
    }
    let cMedia = breakpoints.current && breakpoints.current.name ? breakpoints.current.name : undefined;
    let currentMedia = "lg";
    if(cMedia =="xl") cMedia = "lg";
    if(!hasWidth && cMedia && medias[cMedia]){
        currentMedia = cMedia;
    } else {
        currentMedia = (hasWidth || !cMedia ? breakpoints.getCurrentMedia(width) : cMedia) || "lg";
    }
    let gutter = medias[currentMedia];
    if(!isNumber(gutter)){
        gutter = 0;
    }
    return {
        row : {flexDirection:'row', flexWrap:'wrap',marginRight:-1*gutter,gutter,currentMedia},
        col : {paddingRight:gutter*1.8,gutter,currentMedia}
    }
}

const MIN_WIDTH = 300;

const getWidth = (width)=>{
    const _width = Dimensions.get("window").width;
    if(typeof width =='number' && width > MIN_WIDTH && width < (_width - 100)){
        return width;
    }
    return _width;
}

/*** retourne les propriétés css du wrapper des colusage 
 *  @param bindEvents {boolean||number}, si l'écoute de l'évènement de redimensionnement de la page sera prise en compte dans ce cas, à chaque fois que la page sera redimenssionnée, la grille sera re-rendue
 *      si bindEvents est un nombre supérieur à MIN_WIDTH alors il s'agit de la dimensions de la fenêtre à prendre en compte pour le calcul de la props responsive
 *  @param opts {object}, les options supplémentaires à appliquer à la grille si bindEvents est un objet alors opts est remplacée par bindEvents
 *  les opts sont de la forme : {marging|margin:bool, spécifie si la marge sera prise en compte}
 */
export function row (bindEvents,opts){
    let _width = Dimensions.get('window').width;
    if(typeof bindEvents =='boolean'){
        opts = {bindEvents};
    } else if(typeof bindEvents ==='number' && bindEvents > MIN_WIDTH){
        opts = {width:MIN_WIDTH};
    } else if(isObj(bindEvents)){
        opts = isObj(opts)? opts : bindEvents;
    }
    opts = defaultObj(opts);
    _width = getWidth(opts.width);

    bindEvents = typeof opts.bindEvents ==='boolean'? opts.bindEvents : typeof opts.bindResizeEvents ==='boolean'? opts.bindResizeEvents : false;
    const marging = typeof opts.noMargin =='boolean' ? !opts.noMargin : defaultBool(opts.margin,true);
    if(bindEvents){
        _width = useWindowDimensions().width;
    }
    let {gutter,currentMedia,marginRight,...rest} = rowCol(_width).row;
    if(marging){
        rest.marginRight = marginRight;
    }
    return rest;
}

/**** détermnine les styles de la colonne appropriée en fonction des dimensions courante de l'écran
 * exemple col("md-5 xs-3 lg-8 sm-10")
 * exemple col("md_5 xs_3 lg_3 sm_3")
 * exemple col("col-3 xs-4 lg-5") retourne par défaut 3 colonnes par défaut, 4 pour les xs, 5 pour les lg
 * les options par défaut de la formule c'est la grille sur 3 colonnes en environnement desktop, une colonne en environnement mobile, 2 colonnes en environnement tablet
 * @param : les options responsive de colonne à retrouver
 * @param : all {boolean} si toutes les options calculées par la fonction rowCol seront retournées 
*/
export function col(opts,all){
    let width = undefined;
    if(typeof opts =='number' && opts > MIN_WIDTH){
        width = opts;
        opts = undefined;
    }
    if(!opts || (typeof opts !=='string' && typeof opts !=='object')){
        opts = mediaQueries;
    }
    width = width ? width : isObj(opts) && isNumber(opts.width) && opts.width > MIN_WIDTH ? opts.width : undefined;
    width = getWidth(width);
    let {gutter,currentMedia,...rest}= rowCol(width,isObj(opts) ? defaultBool(opts.update,opts.forceUpdate,false) : false).col;
    let otherStyle = {}, commonMultiplicater = undefined;
    let mQuery = typeof opts === 'string' && opts ? opts :undefined;
    if(!mQuery && isObj(opts)){
        if((opts.useDefaultMedia || opts.useDefault)){
            mQuery = mediaQueries;
        } else {
            let hasF = typeof opts.col =='number' && opts.col || typeof opts.column =='number' && opts.column ? true : false;
            if(!hasF){
                for(let i in medias){
                    if(typeof opts[i] == 'number' && opts[i]){
                        hasF = true;
                        break;
                    }
                }
            }
            if(!hasF) mQuery = mediaQueries;
        }
    }
    if(mQuery){
        let split = mQuery.trim().split(" ");
        opts = isObj(opts)? opts : {};
        for(let i in split){
            if(split[i]){
                let sp = defaultStr(split[i]).replaceAll("_","-").trim().toLowerCase();
                if(sp){
                    let spSplit = sp.split("-");
                    let media = spSplit[0],mediaValue = spSplit[1];
                    if(media =="small-phone" || media =="s-phone"){
                        media = "sp"
                    } else if(media =="medium-phone" || media =="m-phone") {
                        media = "mp";
                    } else if(media ==='phone'){
                        media = currentMedia =='xs'? 'xs' : currentMedia == 'sp'? 'sp' : 'mp';
                    } else if(media =="tablet") {
                        media = currentMedia == "sm"? "sm" : "md";
                    } else if(media =='xl' || media =="desktop"){
                        media = "lg";
                    }
                    if(currentMedia === media && spSplit.length ===2){
                        if(mediaValue ==="hidden"){
                            otherStyle.display = "none";
                        } else if(canBeNumber(mediaValue)){
                            opts = {[currentMedia]:parseDecimal(mediaValue)}
                        }
                    } else if((media =="col" || media =="column") && canBeNumber(mediaValue)){
                        let v = parseDecimal(mediaValue);
                        if(v <= 12){
                            commonMultiplicater = v;
                        }
                    }
                }
                
            }
        }
    }
    let multiplicater = 12;
    let hasFound = false;
    if(isObj(opts)){
        for(let i in opts){
            if(i == "col" || i == "column"){
                if(isNumber(opts[i]) && opts[i] <=12){
                    commonMultiplicater = opts[i];
                }
            } else if(i == currentMedia){
                if(isNumber(opts[i]) && opts[i] <=12){
                    multiplicater = opts[i];
                    hasFound = true;
                    break;
                }
            }
        }
    }
    if(!hasFound && isNumber(commonMultiplicater)){
        multiplicater = commonMultiplicater;
    }
    let ret = {
        ...rest,
        ...otherStyle,
        width: (colWidth*multiplicater).toFixed(8)+'%'
    }
    if(all === true){
        ret.media = currentMedia;
        ret.multiplicater = multiplicater;
        ret.opts = opts;
        ret.currentMedia = currentMedia;
    }
    return ret;
}
/**** retourne le nombre de colonnes de la vue actuellement disponible */
export function cols(opts){
    const {multiplicater} = col(opts,true);
    let cols = 1;
    if(multiplicater && multiplicater > 0){
        cols = Math.trunc(12/multiplicater);
    }
    return Math.max(cols,1);
}
export const columns = cols;
export default {
    row,
    numColumns : cols,
    cols,
    columns,
    col
}
