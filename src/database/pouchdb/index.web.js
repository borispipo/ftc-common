// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import  PouchDB from "pouchdb";
import {isElectron} from "$cplatform";
import {defaultObj} from "$cutils";
import R from "./sqlitePouch";
let extra = {};
if(isElectron()){
    extra = defaultObj(window.getPouchdbElectron(PouchDB,window,R));
}
export default   {
    PouchDB,
    ...extra,
}