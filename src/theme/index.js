// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {isObj,defaultNumber,extendObj,defaultObj,isNonNullString,defaultVal,defaultStr} from "$cutils";
import Colors from "./colors";
import {isWeb,isIos} from "$cplatform";
import PropTypes from "prop-types";
import styled  from "$active-platform/styled";
import updateNativeTheme from "./updateNative";
import * as React from "react";
import { isComponent } from "$react/isComponent";
import defTheme,{white,black,lightColors,darkColors} from "./defaultTheme";
import { themeRef } from "./utils";
import appConfig from "$capp/config";
import styles,{flattenStyle,_cursorPointer} from "./styles";

import APP from "$capp/instance";

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
   @see : https://github.com/pchmn/expo-material3-theme/blob/main/src/ExpoMaterial3Theme.types.ts#L59-L62
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
    colors.info = Colors.isValid(colors.info)? colors.info : lightColors.info;
    colors.warning = Colors.isValid(colors.warning)? colors.warning : lightColors.warning;
    colors.error = Colors.isValid(colors.error)? colors.error : lightColors.error;
    colors.success = Colors.isValid(colors.success)? colors.success : lightColors.success;
    ['primary','secondary','background','surface','error','success','info','warning'].map((c)=>{
        const key = c+"Text",onKey="on"+c.trim().ucFirst();
        colors[key] = colors[onKey] = Colors.isValid(colors[onKey]) ? colors[onKey] :  Colors.isValid(colors[key])? colors[key] : Colors.getContrast(colors[c])
    });
    if(!Colors.isValid(colors.primaryOnSurface)){
        if( Colors.getContrast(colors.primary) === Colors.getContrast(colors.onSurface)){
            colors.primaryOnSurface = colors.primary;
        } else {
            colors.primaryOnSurface = colors.onSurface;
        }
    }
    if(!Colors.isValid(colors.secondaryOnSurface)){
        if(Colors.getContrast(colors.secondary) == Colors.getContrast(colors.onSurface)){
            colors.secondaryOnSurface = colors.secondary
        } else {
            colors.secondaryOnSurface = colors.onSurface;
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










const Theme = {
    current : defaultTheme,
}



export const getTheme = x => Theme.current ? Theme.current : defaultTheme;

export const getColors  =  x => getTheme().colors;

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


/*** récupère une propriétée associée au theme courant */
export const getProperty = function(){
    const args = Array.prototype.slice.call(arguments,0);
    for(let i in args){
        let key = args[i];
        if(typeof key =='string' && key){
            key = key.trim();
            const v = Theme.current[key];
            if(v !== undefined && v !== null) return v;
        }
    }
    return undefined;
}
///récupère la position du profil avatar
export const getProfilAvatarPosition = x=>{
    if(isNonNullString(Theme.current.profilAvatarPosition)){
        return Theme.current.profilAvatarPosition.trim();
    }
    if(appConfig.get("showProfilAvatarOnDrawer") === false) return "appBar";
    return "drawer";
}
const setAlphaColor = (color,alpha)=>{
    return Colors.setAlpha(color,typeof alpha ==="number"? alpha : ALPHA);
};
const theme = {
    get ALPHA () {return ALPHA},
    get current(){ return Theme.current;},
    get name(){return Theme.current.name;},
    get alphaColor (){
        return setAlphaColor;
    },
    get setAlphaColor(){return setAlphaColor;},
    get ALPHA_OPACITY () {return ALPHA_OPACITY},
    get colors () {return Theme.current.colors},
    get primary (){ return Theme.current.colors.primary;},
    get secondary(){return Theme.current.colors.secondary;},
    get fonts () { return Theme.current.fonts},
    get dark () { return Theme.current.dark},
    get isDark () { return isDark},
    get isLight (){ return isLight},
    get isDarkUI (){return isDarkUI},
    get roundness () { return Theme.current.roundness},
    get animation () { return Theme.current.animation;},
    get textFieldMode () {
        return Theme.current.textFieldMode;
    },
    get profilAvatarPosition (){
        return  getProfilAvatarPosition();
    },
    get profilAvatarPos(){
        return getProfilAvatarPosition();
    },
    /*** si le profil avatar de l'utilisateur sera affiché sur le drawer */
    get showProfilAvatarOnDrawer (){
        return getProfilAvatarPosition().toLowerCase() === 'drawer'? true : false;
    },
    get withStyles (){ return withStyles},
    get flattenStyle(){return flattenStyle},
    get StyleProp (){return StyleProp},
    get StyleProps () {return StyleProp},
    get Colors (){return Colors},
    get styles (){return styles},
    /*** si la couleur du status bar est sombre */
    get isStatusBarColorDarken (){ return isStatusBarColorDarken; },
    /**** la couleur de surface dynamique fonction du thème dark où non */
    get surfaceBackgroundColor (){ return isDark()? theme.colors.background : theme.colors.surface},
    //get surfaceTextColor (){ return isDark()? theme.colors.background : theme.colors.surface},
    get get (){
        return getProperty;
    },
    get getProperty(){
        return getProperty;
    }
}


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
export const updateTheme = (currentTheme)=>{
    currentTheme = updateColors(currentTheme);
    if(isValid(currentTheme)){
        Object.map(defaultTheme,(v,i)=>{
            if(i !=='colors' && !(i in currentTheme)){
                currentTheme[i] = v;
            }
        });
        if(typeof appConfig.extendAppTheme ==='function'){
            const r = appConfig.extendAppTheme(currentTheme,theme);
            if(isValid(r)){
                currentTheme = r;
            }
        }
        updateNativeTheme(currentTheme,theme);
        if(themeRef && typeof themeRef.setBackgroundColor =='function'){
            themeRef.setBackgroundColor(currentTheme.colors.background);
        }
        setTimeout(()=>{
            APP.trigger(APP.EVENTS.UPDATE_THEME,currentTheme);
        },100);
        Theme.current = currentTheme;
    }
    return currentTheme;
} 

export default theme;

export  {theme};

export * from "./styles";

export const StylePropTypes = PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
    PropTypes.number,
]);

export const StylePropsTypes = StylePropTypes;
export const StyleProps  = StylePropsTypes;
export const StyleProp = StylePropsTypes;

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
        shouldForwardProp : (prop,defaultValidatorFn,...rest)=>{
            const cP = customShouldForwardProps(prop,defaultValidatorFn,...rest);
            if(cP === false) return false;
            if(cP === true && typeof opts.shouldForwardProp =='function') return true;
            return prop !=="cursorPointer" && prop !=="cursorNotAllowed" && !colorsKeysAlias[prop] && prop !=='surface' && prop !== 'withStyle' ? true : false;
        }
    })(({color,surface,bold,userSelect,noPadding,noMargin,textBold,cursorNotAllowed:cCursorNotAllowed,cursorPointer:cCursorPointer,loading,withStyle,disabled,backgroundColor,mode:customMode,style,...rest }) =>{
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
        if(_cursorPointer?.cursor){
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
        if(typeof userSelect ==='boolean'){
            style.userSelect = userSelect ? "all" : "none";
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