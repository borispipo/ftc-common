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