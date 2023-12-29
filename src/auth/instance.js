// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import authSignIn2SignOut, * as Utils from "./utils";
import * as Remote from "./remote";
import * as Perms from "./perms";
import extendObj from "$cutils/extendObj";

export * from "./remote";
export * from "./utils";
export * from "./perms";

extendObj(authSignIn2SignOut,Utils,Remote,Perms)

export const isMasterAdmin = (...a)=>authSignIn2SignOut.isMasterAdmin(...a);

export default authSignIn2SignOut;