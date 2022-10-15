// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

export default function isTouchDevice() {
    if(typeof document != 'undefined' && document && document.createElement){
        try {
            document.createEvent("TouchEvent");
            return true;
          } catch (e) {
              if(typeof window ==='undefined' || !window) return false;
              return 'ontouchstart' in window        // works on most browsers 
              || 'onmsgesturechange' in window;  // works on IE10 with some false positives
            return false;
          }
    }
    if(typeof window !=='undefined' && window){
        return 'ontouchstart' in window || 'onmsgesturechange' in window;
    }
    return false;
}