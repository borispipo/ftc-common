// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { getLoggedUser } from "./utils/session";
import isMasterAdmin from "$isMasterAdmin";
import {defaultObj} from "$utils";

export default function isAuthMasterAdmin(user){
    user = defaultObj(user,getLoggedUser());
    return typeof isMasterAdmin =='function'? isMasterAdmin(user) : false;
}