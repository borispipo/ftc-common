// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {isObj,defaultNumber,extendObj,defaultObj,defaultStr} from "$cutils";
import Colors from "./colors";
import {isWeb,isIos} from "$cplatform";
import PropTypes from "prop-types";
import styled  from "$active-platform/styled";
import updateNativeTheme from "./updateNative";
import {modes} from "$common/TextField/utils";
import {isMobileMedia} from "$cplatform/dimensions";
import * as React from "react";
import { isComponent } from "$react/isComponent";
import defTheme,{white,black,lightColors,darkColors} from "./defaultTheme";
import { getStyleSheet,themeRef } from "./utils";

import APP from "$capp/instance";
const StyleSheet = getStyleSheet();
export * from "./utils";

import { ALPHA_OPACITY,ALPHA } from "./utils";

/**** check si le système est en mode dark */
export const isDarkUI = x => themeRef && typeof themeRef.isDarkUI =='function' ? themeRef.isDarkUI() : false;

export const isValidColors = colors => isObj(colors) && (Colors.isValid(colors.primary) || Colors.isValid(colors.primaryColor)) ? true : false;
export const isValid = theme => isObj(theme) && isValidColors(theme.colors) ? true : false;
export const isStatusBarColorDarken = x=>{
    return false;
}


/*** modifie les couleurs du theme pris en paramètre 
 * @param {object} objet theme ou tout simplement les couleurs pris en paramètre, valide selon la fonction isValid
 * @return {object} theme dont les couleurs ont été modifiées
*/
export const updateColors  = (theme,force)=>{
    if(force !== true){
        const cTheme = getTheme();
        if(isValidColors(theme)){
            theme = {...cTheme,colors:{...cTheme.colors,...theme}};
        }
    }
    if(!isValid(theme)) return theme;
    const dColors = theme.dark || isDarkUI() ? darkColors : lightColors;
    const colors = theme.colors = {...dColors,...theme.colors};
    ///la couleur secondaire
    colors.primary = Colors.isValid(colors.primary)? colors.primary : Colors.isValid(colors.primaryColor)? colors.primaryColor : cTheme.primary;
    colors.secondary = Colors.isValid(colors.secondary)? colors.secondary : Colors.isValid(colors.secondaryColor)? colors.secondaryColor  : cTheme.colors.secondary;
    colors.primaryText = Colors.isValid(colors.primaryText)? colors.primaryText : Colors.getContrast(colors.primary);
    colors.secondaryText = Colors.isValid(colors.secondaryText)? colors.secondaryText : Colors.getContrast(colors.secondary);
    colors.surfaceText = Colors.getContrast(colors.surface);
    colors.info = Colors.isValid(colors.info)? colors.info : lightColors.info;
    colors.warning = Colors.isValid(colors.warning)? colors.warning : lightColors.warning;
    colors.error = Colors.isValid(colors.error)? colors.error : lightColors.error;
    colors.success = Colors.isValid(colors.success)? colors.success : lightColors.success;
    ['error','success','info','warning'].map((c)=>{
        const key = c+"Text";
        colors[key] = Colors.isValid(colors[key])? colors[key] : Colors.getContrast(colors[c])
    });
   
    if(!Colors.isValid(colors.primaryOnSurface)){
        if(Colors.getContrast(colors.primary) === Colors.getContrast(colors.surface)){
            colors.primaryOnSurface = colors.primary
        } else {
            colors.primaryOnSurface = colors.secondary;
        }
    }

    if(!Colors.isValid(colors.secondaryOnSurface)){
        if(Colors.getContrast(colors.secondary) === Colors.getContrast(colors.surface)){
            colors.secondaryOnSurface = colors.secondary
        } else {
            colors.secondaryOnSurface = colors.primary;
        }
    }

    //la couleur du status bar
    colors.statusBar = theme.dark ? colors.surface : isStatusBarColorDarken() ? Colors.darken(colors.primary) : colors.primary;
    return theme;
}

const defaultTheme = updateColors(defTheme,true);

export {defaultTheme};

export {Colors,lightColors,darkColors,white,black};
export {tinyColor} from "./colors"

export const LINE_HEIGHT = 20;

export const DISABLED_OPACITY = 0.77;

export const READ_ONLY_OPACITY = 0.82;

export const READONLY_OPACITY = READ_ONLY_OPACITY;









const Theme = {
    current : defaultTheme,
}



export const getTheme = x => Theme.current ? Theme.current : defaultTheme;

export const getColors  =  x => getTheme().colors;


/**** permet de mettre à jour le thème courant : 
 *  @voir : https://callstack.github.io/react-native-paper/theming.html
 *  @paramètre de l'objet Theme : {
    primary - primary color for your app, usually your brand color.
    secondary - secondary color for your app which complements the primary color.
    background - background color for pages, such as lists.
    surface - background color for elements containing content, such as cards.
    text - text color for content.
    disabled - color for disabled elements.
    placeholder - color for placeholder text, such as input placeholder.
    backdrop - color for backdrops of various components such as modals.
    onSurface - background color for snackbars
    notification - background color for badges
 * }
 * 
 */

export const updateTheme = (theme)=>{
    theme = updateColors(theme);
    if(isValid(theme)){
        Object.map(defaultTheme,(v,i)=>{
            if(i !=='colors' && !(i in theme)){
                theme[i] = v;
            }
        })
        updateNativeTheme(theme);
        if(themeRef && typeof themeRef.setBackgroundColor =='function'){
            themeRef.setBackgroundColor(theme.colors.background);
        }
        APP.trigger(APP.EVENTS.UPDATE_THEME,theme);
        Theme.current = theme;
    }
    return theme;
} 

export const remToPixel=  (x)=> 16*defaultNumber(x);

export const pixelToRem  = x => 0.0625 * defaultNumber(x);


//@see : https://docs.expo.dev/versions/latest/sdk/status-bar/#statusbarstyle
export const getStatusBarStyle = ()=>{
    const statusBarStyle = {
        animated: true
    }
    statusBarStyle.backgroundColor = theme.colors.statusBar;
    statusBarStyle.style = (Colors.isLight(theme.colors.statusBar)? "dark" : "light");
    return statusBarStyle;
}

export {default as grid} from "./grid";

export const isDark = checkSystemUI => Theme.current.dark ? true : checkSystemUI === true ? isDarkUI():false;
export const isLight = x=> !isDark(x);

/***** possibilité de charger le mode d'affichage par défaut des champs textuels dans le theme de l'application */
export const getTextFieldMode = x=> {
    if(typeof Theme.current.textFieldMode =='string' && Theme.current.textFieldMode && modes[Theme.current.textFieldMode]){
        return modes[Theme.current.textFieldMode];
    }
    return isMobileMedia()? modes.shadow : modes.flat;
}

const theme = {
    get ALPHA () {return ALPHA},
    get ALPHA_OPACITY () {return ALPHA_OPACITY},
    get colors () {return Theme.current.colors},
    get fonts () { return Theme.current.fonts},
    get dark () { return Theme.current.dark},
    get isDark () { return isDark},
    get isLight (){ return isLight},
    get isDarkUI (){return isDarkUI},
    get roundness () { return Theme.current.roundness},
    get animation () { return Theme.current.animation;},
    get textFieldMode () {return getTextFieldMode()},
    get webFontFamilly () {return  webFontFamilly;},
    get withStyles (){ return withStyles},
    get styles (){return styles},
    /*** si la couleur du status bar est sombre */
    get isStatusBarColorDarken (){ return isStatusBarColorDarken; },
    /**** la couleur de surface dynamique fonction du thème dark où non */
    get surfaceBackgroundColor (){ return isDark()? theme.colors.background : theme.colors.surface},
    //get surfaceTextColor (){ return isDark()? theme.colors.background : theme.colors.surface},
}


export default theme;

export  {theme};

const _cursorPointer = isWeb()? {cursor:'pointer'} : {};
const _cursorNotAllowed = isWeb()? {cursor:'not-allowed'} : {};
const stylesShortcuts = {};
const a = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,25,35,45,100],b = ['Left','Right','Top','Bottom'];
a.map((v)=>{
    const v10 = v >= 10 ? v : v*10;
    const isTenMultiplier = v10%10 == 0 || v10%5 ==0 ? true : false;
    const isLessThanTen = v && v < 10;
    
    /*** les valeurs de flex : flex0, flex1, flex2, ....flex10 pour flex : 10 */
    stylesShortcuts['flex'+v] = stylesShortcuts['f'+v] = {
        flex : v
    }
    /*** les props de lineHeight */
    stylesShortcuts['lh'+v] = {
        lineHeight : v10,
    }
    stylesShortcuts['fs'+v] = {
        fontSize : v10,
    }
    if(isLessThanTen){
        /*** les props de lineHeight */
        stylesShortcuts['lh0'+v] = {
            lineHeight : v,
        }
        stylesShortcuts['fs0'+v] = {
            fontSize : v,
        }
    }
    
    /*
    stylesShortcuts['fs'+v10] = stylesShortcuts['f'+v] = {
        width : v10
    }*/
    
    /*** uniquement pour les multiples de 10 et 5 */
    if(isTenMultiplier){
        /*** les propriétés de longueur : w0, w10, 100 pour 100%, ... */
        stylesShortcuts['w'+v10] = {
            width : v10+"%"
        }
        /*** propriété de hauteur en pourcentage : h10 pour height:10%, h11 pour height : 11% */
        stylesShortcuts['h'+v10] = {
            height : v10+"%"
        }
        /*** les proprités de padding : p10 : padding : 10 */
        stylesShortcuts['p'+v] = {
            padding : v10
        }
        /*** les propriétés de margin pour m10 pour margin 10, m20 pour margin 20 */
        stylesShortcuts['m'+v] = {
            margin : v10
        }
        /*** les propriétés de paddingHorizontal */
        stylesShortcuts['ph'+v] = {
            paddingHorizontal : v10,
        }

        /*** les props de padding vertical */
        stylesShortcuts['pv'+v] = {
            paddingVertical : v10,
        }
        /*** les props de margin horizontal */
        stylesShortcuts['mh'+v] = {
            marginHorizontal : v10,
        }
        /*** les props de margin vertical mv10 pour margin vertical 10 */
        stylesShortcuts['mv'+v] = {
            marginVertical : v10,
        }

        b.map((t)=>{
            ///les propriétés de marginLeft : ml margin right [mr], margin top [mt], margin bottom [mb]
            const c = t[0].toLowerCase();
            stylesShortcuts['m'+c+v] = {
                ['margin'+t] : v10,
            }
            stylesShortcuts['p'+c+v] = {
                ['padding'+t] : v10,
            }
            
        });

        /*** les propriétés en 0... */
        if(isLessThanTen){
            /*** les propriétés de longueur : w0, w10, 100 pour 100%, ... */
            stylesShortcuts['w0'+v] = {
                width : v+"%"
            }
            /*** propriété de hauteur en pourcentage : h10 pour height:10%, h11 pour height : 11% */
            stylesShortcuts['h0'+v] = {
                height : v+"%"
            }
            /*** les proprités de padding : p10 : padding : 10 */
            stylesShortcuts['p0'+v] = {
                padding : v
            }
            /*** les propriétés de margin pour m10 pour margin 10, m20 pour margin 20 */
            stylesShortcuts['m0'+v] = {
                margin : v
            }
            /*** les propriétés de paddingHorizontal */
            stylesShortcuts['ph0'+v] = {
                paddingHorizontal : v,
            }

            /*** les props de padding vertical */
            stylesShortcuts['pv0'+v] = {
                paddingVertical : v,
            }
            /*** les props de margin horizontal */
            stylesShortcuts['mh0'+v] = {
                marginHorizontal : v,
            }
            /*** les props de margin vertical mv10 pour margin vertical 10 */
            stylesShortcuts['mv0'+v] = {
                marginVertical : v,
            }
        }
    }
});

/*** la police principale en application web */
export const webFontFamilly =  isWeb() ? {
    fontFamily : '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue","Fira Sans",Ubuntu,Oxygen,"Oxygen Sans",Cantarell,"Droid Sans","Apple Color Emoji","Segoe UI Emoji","Segoe UI Emoji","Segoe UI Symbol","Lucida Grande",Helvetica,Arial,sans-serif',
} : null;
export const styles = !StyleSheet? {} : StyleSheet.create({
    shadow : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        elevation: 2,
    },
    textAlignCenter : {
        textAlign:'center',
    },
    lineHeight: {
        lineHeight : LINE_HEIGHT,
    },  
    disabled : {
        opacity : DISABLED_OPACITY,
    },
    readOnly : {
        opacity : READONLY_OPACITY
    },
    cursorPointer:_cursorPointer,
    cursorNotAllowed : _cursorNotAllowed,
    row : {
        flexDirection : 'row',
        justifyContent : 'flex-start',
        alignItems : 'center',
    },
    rowReverse : {
        flexDirection : "row-reverse",
    },
    justifyContentFlexStart : {
        justifyContent : 'flex-start'
    },
    justifyContentCenter : {
        justifyContent : 'center'
    },
    justifyContentFlexEnd : {
        justifyContent : 'flex-end'
    },
    justifyContentSpaceBetween : {
        justifyContent : 'space-between'
    },
    alignItemsFlexStart : {
        alignItems : 'flex-start'
    },
    alignItemsCenter : {
        alignItems : 'center'
    },
    alignItemsFlexEnd : {
        alignItems : 'flex-end'
    },
    wrap : {
        flexWrap : 'wrap',
    },
    flexWrap : {flexWrap : 'wrap'},
    noWrap : {flexWrap:'nowrap'},
    rowWrap : {
        flexDirection : 'row',
        justifyContent : 'flex-start',
        alignItems : 'center',
        flexWrap : 'wrap'
    },
    hidden : {
        display : 'none',
        opacity : 0,
    },
    noPadding : {
        padding : 0,
        paddingHorizontal : 0,
        paddingVertical : 0,
    },
    noMargin : {
        margin : 0,
        marginHorizontal : 0,
        marginVertical : 0,
    },
    webFontFamilly,
    bold : {
        fontWeight:'bold',
    },
    label: {fontWeight:'normal'},
    bold : {fontWeight:'bold'},
    ...stylesShortcuts,
    absoluteFill : StyleSheet.absoluteFillObject,
});

export const disabledStyle = styles.disabled;

export const readOnlyStyle = styles.readOnly;

export const cursorPointer = styles.cursorPointer;

export const cursorNotAllowed = styles.cursorNotAllowed;

export const StylePropTypes = PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
    PropTypes.number,
]);

export const StylePropsTypes = StylePropTypes;
export const StyleProps  = StylePropsTypes;
export const StyleProp = StylePropsTypes;


export function flattenStyle(style) {
    if (style === null || typeof style !== 'object') {
      return  {};
    }
    if(typeof StyleSheet.flatten !='function') return style;
    return Object.assign({},StyleSheet.flatten(style));
}

/** retourne un  */
export const getColorFromAlias = (color,defaultColor)=>{
    color = defaultStr(color,defaultColor);
    if(!color) return undefined;
    color = color.trim();
    const col = color;
    const colors = theme.colors;
    if(!colors[color]){
        color = color.toLowerCase();
    }
    if(!colors[color]){
        color = color.toCamelCase();
    }
    return colors[color] || Colors.isValid(col)? col : undefined;
}
const ComponentWrapper = (Component,displayName)=>{
    const WrapC = React.forwardRef((props,ref)=>{
        return <Component {...props} ref={ref}/>
    });
    WrapC.displayName = defaultStr(Component.displayName,displayName,"ComponentWrapperName");
    WrapC.propTypes = WrapC.propTypes || Component.propTypes;
    return WrapC;
};
export const colorsAlias = ['primary','secondary','success','error','danger','warning','normal']
export const colorsKeysAlias = {};

colorsAlias.map((c)=>{
    colorsKeysAlias[c] = true;
    colorsKeysAlias[c+"Text"] = true;
    colorsKeysAlias[c+"Color"] = true;
});

export {styled};


/**** le chmap mode est utilisé pour déterminé comment les propriété primay, secondary, ...et autre seront appliquées
 *    si mode est différent de contained alors, l'attribut primary ou secondary ou success, donne uniquement 
 *     la couleur primary ou success au composant. sinon, cet attribut donne comme backgroundColor, la couleur primary ou success, ...
 *      et comme couleur, la valeur du texte lié à ladite couleur
 *   La props withStyle, permet de spécifier si en dépit de la couleur définie dans le composant, la props style color|background sera calculé en fonction des propriétés de ColorsAlias
 */
export const withStyles = (Component,options,mutator)=>{
    Component = isComponent(Component)? Component : defaultStr(Component);
    options = typeof options =='object' && options ? options : {};
    const {mode,mutator:customMutator,displayName, ...opts} = options;
    const customShouldForwardProps = typeof opts.shouldForwardProp =='function'? opts.shouldForwardProp : x=>true;
    if(!Component) return React.Fragment;
    mutator = typeof customMutator =='function'? customMutator : typeof mutator =='function'? mutator : undefined;
    return styled(ComponentWrapper(Component,displayName),{...opts,
        shouldForwardProp : (prop,defaultValidatorFn)=>{
            if(customShouldForwardProps(prop) === false) return false;
            return prop !=="cursorPointer" && prop !=="cursorNotAllowed" && !colorsKeysAlias[prop] && prop !=='surface' && prop !== 'withStyle' ? true : false;
        }
    })(({color,surface,bold,noPadding,noMargin,textBold,cursorNotAllowed:cCursorNotAllowed,cursorPointer:cCursorPointer,loading,withStyle,disabled,backgroundColor,mode:customMode,style,...rest }) =>{
        const isContained = (typeof customMode =='string' && customMode ? customMode : mode) == 'contained' ? true : false;
        rest = defaultObj(rest);
        const colors = theme.colors;
        style = flattenStyle(style);
        color = getColorFromAlias(color);
        backgroundColor = getColorFromAlias(backgroundColor);
        if(withStyle || (!style.color && !style.backgroundColor && !Colors.isValid(color) && !Colors.isValid(backgroundColor))){
            for(let i in colorsAlias){
                let c = colorsAlias[i];
                if(c =='normal'){
                    c = 'text';
                }
                const colorTextContrast = (c+"Text");
                const colorTextColor = (c+"Color");
                if(rest[c]){
                    if(colors[c]){
                        if(!isContained){
                            style.color = colors[c];
                            break;
                        } else {
                            style.backgroundColor = colors[c];
                            if(colors[colorTextContrast]){
                                style.color = colors[colorTextContrast];
                                break;
                            } else {
                                style.color = Colors.isValid(style.color)? style.color : Colors.getContrast(colors[c]);
                                break;
                            }
                        }
                    } else  if(colors[colorTextColor]){
                        style.color = colors[colorTextColor];
                        break;
                    }
                } else {
                    if(rest[colorTextContrast] && colors[colorTextContrast]){
                        style.color = colors[colorTextContrast];
                    } else if(rest[colorTextColor] && colors[colorTextColor]){
                        style.color = colors[colorTextColor];
                    }
                }
            }
        }
        color = Colors.isValid(style.color)? style.color : Colors.isValid(color)? color : undefined;
        backgroundColor = Colors.isValid(style.backgroundColor)? style.backgroundColor : Colors.isValid(backgroundColor)? backgroundColor : undefined;
        if(surface){
            if(!backgroundColor){
                backgroundColor = theme.surface;
                color = color || theme.text;
            }
        }
        if(color){
            style.color = color;
        }
        if(backgroundColor){
            style.backgroundColor = backgroundColor;
        }
        if(color && !backgroundColor && disabled && theme.disabled){
            style.color = theme.disabled;
        }
        if(disabled || loading){
            style.opacity = style.opacity || 0.3;
            if(isWeb() && !style.cursor){
                style.cursor = "none";
            }
        }
        if(bold || textBold){
            style.fontWeight = "bold";
        }
        if(_cursorPointer.cursor){
            if(cCursorPointer){
                style.cursor = "pointer";   
            } else if(cCursorNotAllowed){
                style.cursor = "not-allowed";
            }
        }
        if(noPadding){
            style.padding = style.paddingHorizontal = style.paddingVertical = 0;
        }
        if(noMargin){
            style.margin = style.marginHorizontal = style.marginVertical = 0;
        }
        if(typeof mutator =='function'){
            extendObj(style,mutator(style,{...rest,style,disabled,loading,displayName,color,backgroundColor}));
            return style;
        }
        return style;
    })
}

const defaultDarkTheme = {
    ...defaultTheme,
    colors : {...darkColors,primary : "#06b6d4",primary:'#212121',secondary : "#fda4af"},
    dark : true,
}
updateColors(defaultDarkTheme);

export {defaultTheme as defaultLightTheme,defaultDarkTheme};