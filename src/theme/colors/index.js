
 import {isDecimal,defaultDecimal,isNumber,isNonNullString} from "$cutils";
 import * as RNColors from "./rn-colors";
 import namesColors from "./names-colors";
 import {isHex} from "./tiny-color/utils";
 import tinyColor from "./tiny-color";

 export * from "./rn-colors";
 export * from "./tiny-color/utils";
 export * from "./tiny-color";

 const Colors = {...namesColors,...RNColors};
 const ColorsKeys = Object.keys(Colors);
 const countColorsSufix = ColorsKeys.length;


 const avatarSuffix = [ 'red', 'pink', 'purple', 'deep-purple', 'indigo', 'blue', 'light-blue', 'cyan', 'teal', 'green', 'light-green', 'lime', 'yellow', 'amber', 'orange', 'deep-orange', 'brown', 'grey', 'blue-grey']

export {tinyColor};

/*** usage : see @materialy-Colors for list of Colors available
 *  Colors.get("read") => Colors.get("red-500")
 *  Colors.get("red-100")
 *  Colors => {}//Colors object
 *  Colors.getColors => retourne toutes les variantes de couleur de l'objet passé en paramètre
 */
Colors.get = (color)=>{
  if(!isNonNullString(color)) return undefined;
  color = color.replaceAll("-","").replaceAll("_","").toLowerCase().trim();
  return Colors[color] || undefined;
}


Colors.getBrightness = color => {
  return tinyColor(color).getBrightness();
}

/****
* Get contrasts of color 
* Retourne la couleur d'arrière plan à appliquer pour la couleur d'avant plan passée en parmaètre et 
* inversement
* @param hexcolor: couleur au format hexa
* @returns {string} couleur à appliquer sur la couleur hexcolor, pour un bon contraste : back ou white.
*/
Colors.getContrast = function(hexcolor,comparator){
  let contrastColor = Colors.getBrightness(hexcolor);
  comparator = isDecimal(comparator) && comparator > 10 ? comparator : 170//128;
  contrastColor = (contrastColor >= comparator) ? 'black' : 'white';
  return contrastColor;
}

/*** vérifie si la couleur est un chaine de caractère hexa decimal en couleur */
Colors.isHex = isHex;

Colors.isValid = color => {
  return Colors.isHex(color) || tinyColor(color).isValid();
}


//tinyColors methods @see : // https://github.com/bgrins/TinyColor
let stringMethods = [
  "toHsv","toHsl","setAlpha","getAlpha","toHex","toHex8","toRgb","toPercentageRgb","toName",
  "lighten","brighten","darken","desaturate","saturate",""
]

stringMethods.map((m,i)=>{
  Colors[m] = (color,v1,v2)=> tinyColor(color,v1,v2)[m]().toString();
})

Colors.toRgbObj = Colors.toRgbObject = (color)=>tinyColor(color).toRgb();

Colors.toSixDigitsHex = (color)=>{
  if(!Colors.isHex(color)) return "";
  if(color.length === 7 || color.length < 3) return color;
  const col = color.split("#")[1];
  if (col.length === 3) {
    return "#"+col.split('').map(function (hex) {
      return hex + hex;
    }).join('');
  }
  return color;
}

/**** définie la valeur alpha à partir d'une couleur données */
export const setAlpha = Colors.toAlpha= Colors.setAlpha = (color,alpha)=>{
   return Colors.isValid(color) && isDecimal(alpha)? tinyColor(color).setAlpha(alpha).toRgbString(): color;
}

Colors.getLuminance = (color)=> tinyColor(color).getLuminance();

Colors.isDark = (color,mesure)=> {
   let cont = Colors.getBrightness(color);
   mesure = isDecimal(mesure) && mesure > 10 ? mesure : 128; 
   return isDecimal(cont) && cont < mesure ? true : false;
}
Colors.isLight = Colors.isWhite = (color,mesure)=> {
  let cont = Colors.getBrightness(color);
  mesure = isDecimal(mesure) && mesure > 128 ? mesure : 128; 
  return (isDecimal(cont) && cont >= mesure) ? true : false;
}

/*** retourne l'une des couleurs figurant dans la liste des couleurs du tableau avatarSuffixes 
*  @param : numeric, l'indice de la couleur recherchée
* 
*/
export const getColorSuffix = Colors.getColorSuffix =  Colors.getSuffix= function(suffix){
  suffix = defaultDecimal(suffix);
  if(suffix <0){
      suffix = 0;
  } 
  let count = countColorsSufix-1;
  if(suffix < avatarSuffix.length){
     let color = avatarSuffix[suffix].replaceAll("-","").toLowerCase();
     if(Colors[color]) return Colors[color];
  }
  if(suffix > count){
      suffix = suffix%count;
  }
  return Colors[ColorsKeys[suffix]];
}

/**** retourne la background class en prenant en paramètre un index, voir color pour plus */
export const getBackgroundSuffix = Colors.getBackgroundSuffix= Colors.getBgSuffix =  function getBackgroundSuffix(index){
  return Colors.getContrast(getColorSuffix(index))
}
export const getBgSuffix = getBackgroundSuffix;

export const getColor2BackgroundSuffix = Colors.getColor2BackgroundSuffix = Colors.getColor2BgSuffix = (suffix)=>{
    let color = getColorSuffix(suffix);
    return {color,backgroundColor:Colors.getContrast(color)};
}
export const getAvatarStyleFromSuffix = Colors.getAvatarStyleFromSuffix = (suffix)=>{
  suffix = defaultDecimal(suffix);
  let color = getColorSuffix(suffix);
  const colorContrast = Colors.getContrast(color);
  return {color:colorContrast,backgroundColor:color,style:{color:colorContrast,backgroundColor:color}};
}
export const getSuffixStyle = Colors.getSuffixStyle = getColor2BackgroundSuffix;
export const getColor2BgSuffix = getColor2BackgroundSuffix;

export const equalsWhite = Colors.equalsWhite = Colors.isEqualsToWhite = (color)=>{
  color = Colors.isValid(color)? tinyColor(color).toHex().toString().ltrim("#") : defaultStr(color).toLowerCase();
  return color  === 'ffffff'? true : false;
}

export const isEqualsToWhite  = equalsWhite;

export default Colors;

export const randomHex = Colors.random = Colors.randomHex = () => {
  return `#${Math.random().toString(16).slice(2, 8)}`;
}