// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

const Platform = {
    OS: 'web',
    select: (obj) => ('web' in obj ? obj.web : obj.default),
    get isTesting() {
      if (process.env.NODE_ENV === 'test') {
        return true;
      }
      return false;
    }
  };
  
  export default Platform;
  
  
export const isReactNative = ()=> false;