// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import parseDBName from "./utils/parseDBName";
import getDB from "./getDB";
import CONSTANTS from "./constants";
import getData from "./getData";

export * from "./getDB";

export {default as useSWR} from "./useSWR";

export {
    getDB,
    CONSTANTS,
    getData,
    parseDBName,
}

export default {
    getDB,
    CONSTANTS,
    getData,
    parseDBName,
}