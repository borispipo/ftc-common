import Dimensions from "$cplatform/dimensions";
import useStableMemo  from "./useStableMemo";
import { useWindowDimensions } from "$cdimensions";
import {isObj} from "$cutils";

/*** met à jour dynamiquemnet les propriétés style d'un objet en fonction du changement de la taille de l'objet
 * @param {useCurrentMedia} {boolean} si true, alors les propriétés sont mis à jour uniquement si le current media change
 */
export default function useMediaQueryUpdateStyle({useCurrentMedia,target,mediaQueryUpdateStyle,...props}){
    const responsive = typeof mediaQueryUpdateStyle =="function"? true : false;
    const dimensions = responsive ? useWindowDimensions() : null;
    const handleProps = dimensions && useCurrentMedia === true ? Dimensions.getCurrentMedia() : dimensions;
    return dimensions ? useStableMemo(()=>{
        const args = Dimensions.getDimensionsProps();
        args.props = props,
        args.target = target;
        const nStyle = typeof mediaQueryUpdateStyle ==="function"? mediaQueryUpdateStyle(args) : null;
        if(isObj(nStyle) || Array.isArray(nStyle)) return [props.style,nStyle];
        return props.style;
    },[handleProps,mediaQueryUpdateStyle,props.style]) : props.style;
}