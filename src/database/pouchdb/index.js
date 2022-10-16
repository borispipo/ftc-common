// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {isAndroid,isIos} from "$cplatform"
import mobileNativePouchAdapter from "./native.adapter";
let extra = {adapter : mobileNativePouchAdapter.adapter};
import 'react-native-get-random-values';
import  PouchDB from "pouchdb";
PouchDB
  .plugin(mobileNativePouchAdapter)
if(isIos()){
  extra.iosDatabaseLocation = 'Library';
} else if(isAndroid()){
  extra.androidDatabaseImplementation = 2
}
export default {
  PouchDB,
  ...extra
}

export {PouchDB};