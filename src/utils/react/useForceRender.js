// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import * as React from "react";
import useIsMounted from "./useIsMounted";

export default function useForceRender () {
    const isMounted = useIsMounted();
    const [ , dispatch ] = React.useState(Object.create(null));
    return () => {
        if (isMounted()) {
            dispatch(Object.create(null));
        }
    }
}