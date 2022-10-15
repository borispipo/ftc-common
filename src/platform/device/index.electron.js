// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

export default  {
    platform: 'electron',
    select: (spec) => 'electron' in spec ? spec.electron : 'native' in spec ? spec.native : spec.default,
};

if(!window.ELECTRON){
    Object.defineProperties(Window,{
        ELECTRON : {
            value : {},
        }
    })
}
  