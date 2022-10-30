// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import color from 'color';
import configureFonts from './fonts';
import { black, pinkA400, white } from './colors';
import appConfig from "$capp/config";

const isObj = x => x && typeof x =="object" && !Array.isArray(x);
const t = appConfig.theme;

///les couleurs du theme light par défaut, définit dans les configurations
export const defaultLight = isObj(t.light) && t.light.primary ? t.light : t;

///les couleurs du theme dark par défaut, définit dans les configurations
export const defaultDark = isObj(t.dark) && t.dark.primary ? t.dark : {};

export default {
  dark: false,
  roundness: 4,
  version: 2,
  colors: {
    primary: "#3D8B5F",
    secondary : "#354448",
    accent: '#03dac4',
    background: '#f6f6f6',
    surface: white,
    error: '#B00020',
    text: black,
    onSurface: '#000000',
    disabled: color(black).alpha(0.26).rgb().string(),
    placeholder: color(black).alpha(0.54).rgb().string(),
    backdrop: color(black).alpha(0.5).rgb().string(),
    notification: pinkA400,
    ...defaultLight,
  },
  fonts: configureFonts(),
  animation: {
    scale: 1.0,
  },
};