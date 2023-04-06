// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import * as dataFileManager from "./utils";
import fetch from "./fetch";
import upsert from "./upsert";
import remove from "./remove";
import getDB from "./getDB";
import { hasFetch } from "./fetch";
import getAllDB from "./getAllDB";
import { extendTypes } from "./types";
import session from "./session";
import table from "./table";

export * from "./session";
export * from "./types";

export {table};
export {extendTypes};

export * from "./utils";

export {remove};

export {upsert};

export {fetch};

export {getDB};

export {getAllDB};
export {session};

const df = {
    ...dataFileManager,
    table,
    session,
    extendTypes,
    getAllDB,
    fetch,
    upsert,
    getDB,
    remove,
    hasFetch,
}
export default df;