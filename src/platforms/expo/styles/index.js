import {isWeb} from "$cplatform";
import {StyleSheet} from "react-native";

export {StyleSheet};

export const LINE_HEIGHT = 20;

export const DISABLED_OPACITY = 0.75;

export const READ_ONLY_OPACITY = 0.80;

export const READONLY_OPACITY = READ_ONLY_OPACITY;

export const _cursorPointer = isWeb()? {cursor:'pointer'} : {};
export const _cursorNotAllowed = isWeb()? {cursor:'not-allowed'} : {};
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
    stylesShortcuts['flexGrow'+v] = stylesShortcuts['f'+v] = {
        flexGrow : v
    }
    stylesShortcuts['gap'+v] = {
        gap : v10,
    }
    stylesShortcuts['rowGap'+v] = {
        rowGap : v10,
    }
    stylesShortcuts['columnGap'] = {
        columnGap : v10,
    }
    /*** les props de lineHeight */
    stylesShortcuts['lh'+v] = stylesShortcuts['lineHeight'+v] = {
        lineHeight : v10,
    }
    stylesShortcuts['fs'+v] = stylesShortcuts['fontSize'+v] = {
        fontSize : v10,
    }
    if(isLessThanTen){
        /*** les props de lineHeight */
        stylesShortcuts['lh0'+v] = stylesShortcuts['lineHeight0'+v] = {
            lineHeight : v,
        }
        stylesShortcuts['fs0'+v] = stylesShortcuts['fontSize0'+v] = {
            fontSize : v,
        }
    }
    /*** uniquement pour les multiples de 10 et 5 */
    if(isTenMultiplier){
        /*** les propriétés de longueur : w0, w10, 100 pour 100%, ... */
        stylesShortcuts['w'+v10] = stylesShortcuts['width'+v10] = {
            width : v10+"%"
        }
        /*** propriété de hauteur en pourcentage : h10 pour height:10%, h11 pour height : 11% */
        stylesShortcuts['h'+v10] = stylesShortcuts['height'+v10] = {
            height : v10+"%"
        }
        /*** les proprités de padding : p10 : padding : 10 */
        stylesShortcuts['p'+v] = stylesShortcuts['padding'+v] = {
            padding : v10
        }
        /*** les propriétés de margin pour m10 pour margin 10, m20 pour margin 20 */
        stylesShortcuts['m'+v] = {
            margin : v10
        }
        /*** les propriétés de paddingHorizontal */
        stylesShortcuts['ph'+v] = stylesShortcuts['paddingHorizontal'+v] = {
            paddingHorizontal : v10,
        }

        /*** les props de padding vertical */
        stylesShortcuts['pv'+v] = stylesShortcuts['paddingVertical'+v] = {
            paddingVertical : v10,
        }
        /*** les props de margin horizontal */
        stylesShortcuts['mh'+v] = stylesShortcuts['marginHorizontal'+v] = {
            marginHorizontal : v10,
        }
        /*** les props de margin vertical mv10 pour margin vertical 10 */
        stylesShortcuts['mv'+v] = stylesShortcuts['marginVertical'+v] = {
            marginVertical : v10,
        }

        b.map((t)=>{
            ///les propriétés de marginLeft : ml margin right [mr], margin top [mt], margin bottom [mb]
            const c = t[0].toLowerCase();
            stylesShortcuts['m'+c+v] = stylesShortcuts['margin'+c+v] = {
                ['margin'+t] : v10,
            }
            stylesShortcuts['p'+c+v] = stylesShortcuts['padding'+c+v] = {
                ['padding'+t] : v10,
            }
            
        });

        /*** les propriétés en 0... */
        if(isLessThanTen){
            /*** les propriétés de longueur : w0, w10, 100 pour 100%, ... */
            stylesShortcuts['w0'+v] = stylesShortcuts['width0'+v] = {
                width : v+"%"
            }
            /*** propriété de hauteur en pourcentage : h10 pour height:10%, h11 pour height : 11% */
            stylesShortcuts['h0'+v] = stylesShortcuts['height0'+v] = {
                height : v+"%"
            }
            /*** les proprités de padding : p10 : padding : 10 */
            stylesShortcuts['p0'+v] = stylesShortcuts['padding0'+v] = {
                padding : v
            }
            /*** les propriétés de margin pour m10 pour margin 10, m20 pour margin 20 */
            stylesShortcuts['m0'+v] = stylesShortcuts['margin0'+v] = {
                margin : v
            }
            /*** les propriétés de paddingHorizontal */
            stylesShortcuts['ph0'+v] = stylesShortcuts['paddingHorizontal0'+v] = {
                paddingHorizontal : v,
            }

            /*** les props de padding vertical */
            stylesShortcuts['pv0'+v] = stylesShortcuts['paddingVertical0'+v] = {
                paddingVertical : v,
            }
            /*** les props de margin horizontal */
            stylesShortcuts['mh0'+v] = stylesShortcuts['marginHorizontal0'+v] = {
                marginHorizontal : v,
            }
            /*** les props de margin vertical mv10 pour margin vertical 10 */
            stylesShortcuts['mv0'+v] = stylesShortcuts['marginVertical0'+v] = {
                marginVertical : v,
            }
        }
    }
});


export const typograpy = {
    h1: {
        lineHeight: 40,
        fontSize: 32,
    },
    h2: {
        lineHeight: 36,
        fontSize: 28,
    },
    h3: {
        lineHeight: 32,
        fontSize: 24,
    },
    h4: {
        fontSize: 18,
    },
    h5 : {
        fontSize : 15,
    },
    titleLarge: {
        lineHeight: 28,
        fontSize: 22,
    },
    titleMedium: {
        lineHeight: 24,
        fontSize: 16,
    },
    titleSmall: {
        letterSpacing: 0.1,
        lineHeight: 20,
        fontSize: 14,
    },
    
    labelLarge: {
        letterSpacing: 0.1,
        lineHeight: 20,
        fontSize: 14,
    },
    labelMedium: {
        letterSpacing: 0.5,
        lineHeight: 16,
        fontSize: 12,
    },
    labelSmall: {
        letterSpacing: 0.5,
        lineHeight: 16,
        fontSize: 11,
    },
    bodyLarge: {
        lineHeight: 24,
        fontSize: 16,
    },
    bodyMedium: {
        lineHeight: 20,
        fontSize: 14,
    },
    bodySmall: {
        lineHeight: 16,
        fontSize: 12,
    },
}
export const customStyles = {
    boxShadow : {
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
        paddingLeft : 0,
        paddingRight : 0,
        paddingTop : 0,
        paddingBottom : 0,
    },
    noMargin : {
        margin : 0,
        marginLeft : 0,
        marginRight : 0,
        marginTop : 0,
        marginBottom:0,
    },
    webFontFamilly : isWeb()? {
        fontFamily : '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue","Fira Sans",Ubuntu,Oxygen,"Oxygen Sans",Cantarell,"Droid Sans","Apple Color Emoji","Segoe UI Emoji","Segoe UI Emoji","Segoe UI Symbol","Lucida Grande",Helvetica,Arial,sans-serif',
    } : {},
    label: {fontWeight:'normal'},
    bold : {fontWeight:'bold'},
    textDecorationUnderline : {
        textDecorationLine:'underline',
    },
    textDecorationNone : {
        textDecorationLine:'none',
    },
    ...stylesShortcuts,
    absoluteFill : StyleSheet && StyleSheet.absoluteFillObject || {},
    ...typograpy,
}

export const typograpyStyles = StyleSheet.create(typograpy);

export const styles = StyleSheet.create(customStyles);

export default styles;

export const disabledStyle = styles.disabled;

export const readOnlyStyle = styles.readOnly;

export const cursorPointer = styles.cursorPointer;

export const cursorNotAllowed = styles.cursorNotAllowed;