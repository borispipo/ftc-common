// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import * as Utils from "./utils";
import * as Remote from "./remote";
import * as Perms from "./perms";
import isMasterAdmin from "./isMasterAdmin";
import login from "./utils/login";

export * from "./remote";
export * from "./utils";
export * from "./perms";

export {default as login} from "./utils/login";
export {isMasterAdmin};

export default {
    ...Utils,
    ...Remote,
    ...Perms,
    isMasterAdmin,
    login,
    loginUser : login,
}
