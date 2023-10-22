// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import  PouchDB from "pouchdb";
import {isElectron} from "$cplatform";
import {defaultObj} from "$cutils";
import sqlPouch from "./sqlitePouch";
export default   {
    PouchDB,
    ...(isElectron() && window.ELECTRON && defaultObj(ELECTRON.getPouchdb({PouchDB,sqlPouch})) || {}),
}