// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import  PouchDB from "pouchdb";
import sqlPouch from "./sqlitePouch";
import initElectron from "./init-electron";
export default   {
    PouchDB,
    ...initElectron({PouchDB,sqlPouch}),
}