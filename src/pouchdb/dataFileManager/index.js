// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import * as dataFileManager from "./utils";
import fetch from "./fetch";
import upsert from "./upsert";
import remove from "./remove";
import getDB from "./getDB";
import { hasFetch } from "./fetch";

export * from "./utils";

const df = {
    ...dataFileManager,
    fetch,
    upsert,
    getDB,
    remove,
    hasFetch,
}
export default df;