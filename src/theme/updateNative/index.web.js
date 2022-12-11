// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {uniqid} from "$cutils";
import { isWeb } from "$cplatform";
import { TIPPY_THEME } from "./utils";
const themeDomId = uniqid("web-theme-id");
import {Colors} from "$theme";

/*** met à jour le theme en environnement web */
export default function updateWebTheme(theme){
    if(!isWeb()) return null;
    if(typeof document === 'undefined' || !document.getElementById) return null;
    let style = document.getElementById(themeDomId);
    if(!style){
        style = document.createElement("style");
    }
    style.id = themeDomId;
    const primary = theme.colors.primary;
    //const isWhite = Colors.getContrast(primary) =="white"? true : false;
    const trackBG = theme.colors.surface//isWhite ? "#F5F5F5" : "#121212";
    let scrollbarColor = theme.colors.primary;
    if(theme.dark){
        if(Colors.isDark(scrollbarColor)){
            scrollbarColor = Colors.isWhite(theme.colors.secondary) ? theme.colors.secondary : theme.colors.primaryText;
        }
    } else {
        if(Colors.isWhite(scrollbarColor)){
            scrollbarColor = Colors.isDark(theme.colors.secondary) ? theme.colors.secondary : theme.colors.primaryText;
        }
    }
    style.textContent = `
        body,html { 
            -ms-overflow-style: none !important; 
            color:#4b4646;
            -webkit-text-size-adjust: none!important;
            position: relative;
            z-index: 1;
            overflow: hidden!important;
            margin: 0px !important; 
            width: 100% !important; 
            height: 100% !important;
            overflow:hidden!important;
            margin:0!important;
            padding:0!important;
            background-color : ${theme.colors.background};
        }
        body > div {
            background-color : transparent;
        }
        body.desktop ::-webkit-scrollbar-track
        {
            -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
            border-radius: 10px;
            background-color: ${trackBG};
        }

        body.desktop ::-webkit-scrollbar-track
        {
            -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
            background-color: ${trackBG};
        }

        body.desktop ::-webkit-scrollbar
        {
            width: 10px;
            height:10px;
            background-color: ${trackBG};
        }

        body.desktop ::-webkit-scrollbar-thumb
        {
            background-color: ${theme.colors.primary};
        }

        body.desktop.theme-primary-white ::-webkit-scrollbar-thumb
        {
            background-color: ${theme.colors.secondary};
        }

        body.not-touch-device ::-webkit-scrollbar-track
        {
            -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
            border-radius: 10px;
            background-color: ${trackBG};
            border:0px!important;
        }

        body.not-touch-device ::-webkit-scrollbar-track
        {
            -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
            background-color: ${trackBG};
            border:0px!important;
        }

        body.not-touch-device ::-webkit-scrollbar
        {
            width: 10px;
            height:10px;
            background-color: ${trackBG};
            border:0px!important;
        }

        body.not-touch-device ::-webkit-scrollbar-thumb
        {
            background-color: ${scrollbarColor};
        }

        .tippy-box[data-theme~='${TIPPY_THEME}'] {
            background-color: ${theme.colors.primary};
            color: ${theme.colors.primaryText};
            font-weight : 400;
            text-shadow: none;
            -webkit-box-shadow: none;
            -moz-box-shadow: none;
            box-shadow: none;
            font-family: -apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue","Fira Sans",Ubuntu,Oxygen,"Oxygen Sans",Cantarell,"Droid Sans","Apple Color Emoji","Segoe UI Emoji","Segoe UI Emoji","Segoe UI Symbol","Lucida Grande",Helvetica,Arial,sans-serif;
        }
        .tippy-box[data-theme~='${TIPPY_THEME}'][data-placement^='top'] > .tippy-arrow::before {
            border-top-color: ${primary};
        }
        .tippy-box[data-theme~='${TIPPY_THEME}'][data-placement^='bottom'] > .tippy-arrow::before {
            border-bottom-color: ${primary};
        }
        .tippy-box[data-theme~='${TIPPY_THEME}'][data-placement^='left'] > .tippy-arrow::before {
            border-left-color: ${primary};
        }
        .tippy-box[data-theme~='${TIPPY_THEME}'][data-placement^='right'] > .tippy-arrow::before {
            border-right-color: ${primary};
        }
        .tippy-box[data-theme~='${TIPPY_THEME}'] > .tippy-svg-arrow {
            fill: ${primary};
        }
        .tippy-box[data-theme~='${TIPPY_THEME}'] > .tippy-backdrop {
            background-color: ${primary};
        }
        body > iframe {
            z-index : 1!important;
            width : 0px!important;
            height : 0px!important;
        }
        :focus { outline: none!important; }
    `;
    document.body.appendChild(style);
}