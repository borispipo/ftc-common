// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import Colors from "./colors";
import {isObj,defaultStr,defaultObj,extendObj} from "$cutils";
import appConfig from "$capp/config";
import DefaultTheme,{getDefaultLight,getDefaultDark} from './defTheme';
import { ALPHA } from "./alpha";

export const black = "black";

export const white = "white";

export const transparent = "transparent";


let colors = {};
export const lightColors = {
    info : '#1890FF',
    infoText : "white",
    success : '#4caf50',
    successText : "white",
    warning : '#FFC107',
    error: '#B00020',
    errorText : "white",
    text: black,
    background: '#f6f6f6',
    surface: white,
    surfaceText: '#000000',
    disabled: Colors.setAlpha(black,0.26),
    placeholder: Colors.setAlpha(black,ALPHA),
    backdrop: Colors.setAlpha(black,0.5),
    divider : Colors.setAlpha(black,0.18),
    ...getDefaultLight(),
}
export const darkColors = {
    info : '#39c0ed',
    infoText: "black",
    success : '#00b74a',
    warning : '#ffa900',
    warningText: "black",
    error : "#EF4E69",
    errorText: "black",
    background : "#111b21",
    surface : "#343a40",
    surface : "#202c33",
    surfaceText: '#FFFFFF',
    text: white,
    //primaryText : "#aebac1",
    disabled: Colors.setAlpha(white,0.5),
    placeholder: Colors.setAlpha(white,ALPHA),
    backdrop: Colors.setAlpha(black,0.5),
    divider : Colors.setAlpha(white,0.18),
    ...getDefaultDark(),
    //divider : "#dee2e6"
}
const dark1name = "Sombre|Dark";

const defaultTheme = {
    ...DefaultTheme,
    colors : {
        ...DefaultTheme.colors,
        ...lightColors,
        ...getDefaultLight(),
    },
    get name (){
        return appConfig.name || '';
    }
}

export const getColors = ()=>{
    extendObj(lightColors,getDefaultLight());
    extendObj(darkColors,getDefaultDark());
    extendObj(DefaultTheme.colors,getDefaultLight());
    extendObj(defaultTheme.colors,getDefaultLight());
    const t = [
        defaultTheme.name,
        {
            ...lightColors,
            name : "odoo",
            primary : "#714B67",
            secondary : "#017e84",
            primaryText : "rgba(255, 255, 255, 0.9)",
            secondaryText : white,
            surface : "white",
            disabled : "#8f8f8f",
        },
        {
            ...lightColors,
            name : "Custom1",
            profilAvatarPosition : "appBar",
            textFieldMode : "normal",
            primary : "#fafbfc",
            secondary : "#3f6ad8",
            primaryText : "#495057",
            secondaryText : "#fff",
            suface : "#fff",
            error : "#d92550",
            errorText : "white",
            warning : "#f7b924",
            wanringText : "#212529",
        },
        'green-white',
    
        'indigo-pink',
        'indigo-dark_orange',
    
        'dark_blue-white',
        'dark_blue-pink',
        
        'dark_blue-deep_purple',
        'dark_blue1-white',
    
        'custom_blue-white',
        'custom_blue-pink',
        'custom_blue-purple',
    
        'light_black-white',
        'light_black-pink',
    
        'teal-white',
    
        'purple-white',
    
        'pink-white',
        'pink-yellow',
    
        'light_blue-indigo',
    
        'custom_purple-white',
    
        'brown-white',
        'brown-yellow',
        'brown-pink',
    
        'blue_grey-white',
        'blue_grey-yellow',
    
        'blue-white',
        'blue-yellow',
        'blue-indigo',
    ]
    const dark1 = {
        ...darkColors,
        name : dark1name,
        primaryName : dark1name,
        dark: true,
        primary: "#bcab95",
        primaryOnSurface: "#bcab95",
        primaryText: "white",
        secondary: "#fbcfe8",
        secondaryOnSurface: "#fbcfe8",
        secondaryText: "black",
        successText: "black",
        surface: "#202c33",
        surfaceText: "#FFFFFF",
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
            primaryText : Colors.getContrast(primary),
            secondary,
            secondaryText : Colors.getContrast(secondary),
        }
        if(secondaryName =='white'){
            c.primaryOnSurface = primary;
            c.secondaryOnSurface = primary;
            c.secondaryText = black;
            c.disabled = Colors.setAlpha(black,0.6);
        }
        if(isMainTheme){
            colors[dark1name] = dark1;
        }
    }
    return colors;    
}

export default defaultTheme;