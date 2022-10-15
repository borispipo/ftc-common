// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import * as Dim from "./utils";
import Dimensions  from "$active-platform/dimensions";
import { useWindowDimensions } from "./utils";
export * from "./utils";

['get','addEventListener','removeEventListener','set'].map((v)=>{
    Dim[v] = Dimensions[v].bind(Dimensions);
});

export default Dim;


export {useWindowDimensions};