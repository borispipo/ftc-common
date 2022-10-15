// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.


import KeyboardEventHandler from 'react-keyboard-event-handler';
if(!React.KeyboardEventHandler){
    Object.defineProperties(React,{
        KeyboardEventHandler : {value : KeyboardEventHandler,override:false,writable:false},
    })
}
export default KeyboardEventHandler;
