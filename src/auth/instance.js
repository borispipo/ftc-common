// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import * as Utils from "./utils";
import * as Remote from "./remote";

import login from "./utils/login";

export * from "./remote";
export * from "./utils";
export {default as login} from "./utils/login";

export default {
    ...Utils,
    ...Remote,
    login,
    loginUser : login,
}
