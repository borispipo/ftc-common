// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

const config = require("../app/config");

export const ENV = config.env;

export const IS_ENV_DEVELOPMENT = window.__DEV__? true : false;
export const IS_ENV_PRODUCTION = !IS_ENV_DEVELOPMENT;

export default {
    isDevelopment : x=> IS_ENV_DEVELOPMENT,
    isProduction : x=> IS_ENV_PRODUCTION,
}
