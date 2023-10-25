import { StyleSheet } from "$active-platform/styles";
export * from "$active-platform/styles";
export {default} from "$active-platform/styles";

export function flattenStyle(...styles) {
    if (styles == null || typeof styles !== 'object') {
      return  {};
    }
    if(typeof StyleSheet.flatten =='function' ){
      try {
        const t =  StyleSheet.flatten(styles);
        if(typeof t =='object' && t){
          return Object.assign({},t);
        }
      } catch{};
      return {};
    }
    try {
      const flatArray = styles.flat(Infinity);
      const result = {};
      for (let i = 0; i < flatArray.length; i++) {
        const style = flatArray[i];
        if (style != null && typeof style === 'object') {
          Object.assign(result, style);
        }
      }
      return result;
    } catch{}
    return  {};
}