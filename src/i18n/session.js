// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import session from "$session";
import isNonNullString from "$cutils/isNonNullString";
import defaultLang from "./defaultLang";

const sessionKey = "i18n.lang.session";

export const getLang = ()=>{
    let l = session.get(sessionKey);
    return isNonNullString(l)? l : defaultLang;
}

export const setLang = (lang)=>{
    lang = isNonNullString(lang)? lang : defaultLang;
    session.set(sessionKey,lang);
    return lang;
}