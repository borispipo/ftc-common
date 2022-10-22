// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import localSession from "$session";
import {setSessionData} from "$cauth/utils/session";
import {defaultStr} from "$cutils";
/**** sauvegarde la base de données courante dans un cache */
export default function setCurrentDB (currentDB,persist){
    currentDB = defaultStr(currentDB);
    localSession.set("currentDB",currentDB)
    if(persist !== false){
        setSessionData({currentDB});
    }
    return currentDB;
}