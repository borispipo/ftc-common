import * as Dim from "./utils";
import Dimensions  from "$active-platform/dimensions";
import { useWindowDimensions } from "./utils";
export * from "./utils";

['get','addEventListener','removeEventListener','set'].map((v)=>{
    Dim[v] = Dimensions[v].bind(Dimensions);
});

export default Dim;


export {useWindowDimensions};