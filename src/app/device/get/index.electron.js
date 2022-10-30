// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import get from "./index.js";

export default function getElectronDeviceName (){
    return get() || ELECTRON?.DEVICE?.computerName;
}