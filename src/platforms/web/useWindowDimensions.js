// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.


 import Dimensions from './dimensions';
 import { useEffect, useState } from 'react';
 
 export default function useWindowDimensions() {
   const [dims, setDims] = useState(() => Dimensions.get('window'));
   useEffect(() => {
     function handleChange({ window }) {
       if (window != null) {
         setDims(window);
       }
     }
     Dimensions.addEventListener('change', handleChange);
     // We might have missed an update between calling `get` in render and
     // `addEventListener` in this handler, so we set it here. If there was
     // no change, React will filter out this update as a no-op.
     setDims(Dimensions.get('window'));
     return () => {
       Dimensions.removeEventListener('change', handleChange);
     };
   }, []);
   return dims;
 }