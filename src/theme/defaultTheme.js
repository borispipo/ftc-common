// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import Colors from "./colors";
import {isObj,defaultStr,extendObj} from "$cutils";
import appConfig from "$capp/config";
import { ALPHA } from "./alpha";
import configureFonts from './fonts';
import { pinkA400 } from './colors';

export const black = "black";

export const white = "white";

export const transparent = "transparent";

///les couleurs du theme light par défaut, définit dans les configurations
export const getDefaultLight = x=>{
    const t = appConfig.theme;
    return isObj(t.light) && Colors.isValid(t.light.primary) ? t.light : t;
};
  
///les couleurs du theme dark par défaut, définit dans les configurations
export const getDefaultDark = x=>{
    const t = appConfig.theme;
    return isObj(t.dark) && t.dark.primary ? t.dark : {};
};


let colors = {};
export const lightColors = {
    info : '#1890FF',
    onInfo : "white",
    success : '#4caf50',
    onSuccess : "white",
    warning : '#FFC107',
    error: '#B00020',
    onError : "white",
    text: black,
    background: '#f6f6f6',
    surface: white,
    onSurface: '#000000',
    disabled: Colors.setAlpha(black,0.26),
    placeholder: Colors.setAlpha(black,ALPHA),
    backdrop: Colors.setAlpha(black,0.5),
    divider : Colors.setAlpha(black,0.18),
    ...getDefaultLight(),
}
export const darkColors = {
    info : '#39c0ed',
    onInfo: "black",
    success : '#00b74a',
    warning : '#ffa900',
    onWarning: "black",
    error : "#EF4E69",
    onError: "black",
    background : "#111b21",
    surface : "#343a40",
    surface : "#202c33",
    onSurface: '#FFFFFF',
    text: white,
    disabled: Colors.setAlpha(white,0.5),
    placeholder: Colors.setAlpha(white,ALPHA),
    backdrop: Colors.setAlpha(black,0.5),
    divider : Colors.setAlpha(white,0.18),
    ...getDefaultDark(),
}
const dark1name = "Sombre|Dark";

const defaultTheme = {
    dark: false,
    roundness: 4,
    version: 2,
    fonts: configureFonts(),
    animation: {
        scale: 1.0,
    },
    colors : {
        primary: "#3D8B5F",
        secondary : "#354448",
        accent: '#03dac4',
        background: '#f6f6f6',
        surface: white,
        error: '#B00020',
        text: black,
        onSurface: '#000000',
        disabled: Colors.setAlpha(black,0.26),
        placeholder: Colors.setAlpha(black,0.54),
        backdrop: Colors.setAlpha(black,0.5),
        notification: pinkA400,
        ...lightColors,
        ...getDefaultLight(),
    },
    get name (){
        return appConfig.name || '';
    }
}

export const namedColors = [
    'green-white',
    
    'indigo-pink',
    'dark_blue-white',
    'dark_blue-pink',
    'dark_blue-deep_purple',
    
    'custom_blue-white',
    'custom_blue-pink',
    'custom_blue-purple',
    
    'teal-white',
    
    'purple-white',
    
    'light_blue-indigo',
    'custom_purple-white',
    
    'brown-white',
    'brown-pink',
    
    'blue_grey-white',
    
    'blue-white',
    'blue-indigo',
]

export const getColors = ()=>{
    extendObj(lightColors,getDefaultLight());
    extendObj(darkColors,getDefaultDark());
    extendObj(defaultTheme.colors,getDefaultLight());
    const t = [
        defaultTheme.name,
        {
            ...lightColors,
            name : "odoo",
            primary : "#714B67",
            secondary : "#017e84",
            onPrimary : "rgba(255, 255, 255, 0.9)",
            onSecondary : white,
            surface : "white",
            disabled : "#8f8f8f",
        },
        ...namedColors,
    ]
    const dark1 = {
        ...darkColors,
        name : dark1name,
        primaryName : dark1name,
        dark: true,
        primary: "#bcab95",
        primaryOnSurface: "#bcab95",
        onPrimary: "white",
        secondary: "#fbcfe8",
        secondaryOnSurface: "#fbcfe8",
        onSecondary: "black",
        onSuccess: "black",
        surface: "#202c33",
        onSurface: "#FFFFFF",
    }
    const lColors = {
        dark_blue : "#0073b1",
        dark_blue1 : "#124187",
        dark_orange : '#ff6e40',
        light_black : '#212121',
        indigo : '#3f51b5',
        pink : "#e91e63",
        purple : "#9c27b0",
        custom_purple : "#875A7B",
        amber : "#FFBF00",
        lime : '#cddc39',
        deep_purple : '#673ab7',
        deep_orange : '#ff5722',
        light_blue : '#03a9f4',
        custom_blue : '#1976d2',
        blue_grey : '#607d8b',
        light_green : '#8bc34a'
    }
    function getHexColor(colorStr) {
        if(lColors[colorStr]) return lColors[colorStr]
        return Colors.get(colorStr);    
    }
    colors = {};
    for(let i in t){
        if(isObj(t[i])){
           const c = t[i];
           if(c.name && c.primary){
                colors[c.name] = c;
           }
           continue;
        }
        const s = t[i].split("-")
        const primaryName = s[0],secondaryName = defaultStr(s[1]);
        let primary = getHexColor(primaryName)
        let secondary = getHexColor(secondaryName);
        const isMainTheme = t[i] == defaultTheme.name;
        if(isMainTheme){
            primary = defaultTheme.colors.primary; //couleur primaire du logo
            secondary = defaultTheme.colors.secondary; //couleur secondaire du logo
        } 
        if(!primary || !secondary) {
            continue;
        }
        const c = colors[t[i]] =  {
            name : t[i], //le nom du thème
            primaryName,
            secondaryName,
            ...defaultTheme.colors,
            primary,
            onPrimary : Colors.getContrast(primary),
            secondary,
            onSecondary : Colors.getContrast(secondary),
        }
        if(secondaryName =='white'){
            c.primaryOnSurface = primary;
            c.secondaryOnSurface = primary;
            c.onSecondary = black;
            c.disabled = Colors.setAlpha(black,0.6);
        }
        if(isMainTheme){
            colors[dark1name] = dark1;
        }
    }
    return colors;    
}

export default defaultTheme;