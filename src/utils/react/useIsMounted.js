// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { useEffect,useCallback,useRef} from "react";
export default function useIsMounted(){
    const ref = useRef(true);
    useEffect(() => {
        return () => void (ref.current = false);
    }, []);
    return useCallback(() => ref.current, []);
};