// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import parseDBName from "./utils/parseDBName";
import getDB from "./getDB";
import CONSTANTS from "./constants";
import getData from "./getData";
import pouch from "./pouchdb";
import sync from "./sync";
import common from "./common";
import getAllData from "./getAllData";
import servers from "./sync/servers";
import {get as getIndexes, set as setIndexes} from "./utils/pouchdbIndexes";

export * from "./utils";

export {default as dataFileManager} from "./dataFileManager";

const PouchDB = pouch.PouchDB;

export * from "./getDB";

export {
    getDB,
    servers,
    getIndexes,
    setIndexes,
    common,
    CONSTANTS,
    getData,
    parseDBName,
    PouchDB,
    sync,
    getAllData,
}

export default {
    getDB,
    servers,
    getIndexes,
    setIndexes,
    common,
    CONSTANTS,
    getData,
    parseDBName,
    sync,
    getAllData,
}