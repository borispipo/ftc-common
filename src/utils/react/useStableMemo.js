// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import stableHash from 'stable-hash';
import { useMemo } from 'react';

export default function useStableMemo(factory, deps){
    return useMemo(factory, [stableHash(deps)]);
}