// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import areEquals from '../compare';
import { useMemo,useEffect, useRef } from "react";

export default function useStableMemo(factory, deps){
    const ref = useRef(null);
    const areDifferents = !areEquals(ref.current,deps);
    if(areDifferents){
        ref.current = deps;
    }
    return useMemo(factory, [areDifferents]);
}