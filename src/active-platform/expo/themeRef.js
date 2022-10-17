// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {defaultStr} from "$cutils";
import {StyleSheet,Appearance} from "react-native";
import * as SystemUI from 'expo-system-ui';

const themeRef = {
  get isDarkUI(){
     return defaultStr(Appearance.getColorScheme()).toLowerCase() ==="dark"? true : false
  },
  set setBackgroundColor(color){
    return SystemUI.setBackgroundColorAsync(color)
  },
  get StyleSheet (){
    return StyleSheet
  }
}


export default themeRef;