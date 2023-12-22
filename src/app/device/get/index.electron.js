// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import get from "./index.js";
import {isElectron} from "$cplatform";
export default function getElectronDeviceId (){
    return get() || isElectron() && ELECTRON?.DEVICE?.computerName || '';
}