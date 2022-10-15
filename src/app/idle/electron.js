// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

export const runElectronAppStateChangedCallback =  (state) => {
    const isAppActive = (state) && typeof state =='object' ? state.isActive : false;
    if(isAppActive){
        if(canRun){
            inactiveStateLastDate = undefined;
            run(true);
        }
        //on réinitialise le timer
        idle(false);
    } else {
        if(!inactiveStateLastDate){
            inactiveStateLastDate = new Date().getTime();
        }
        const cRun = canRun();
        stop(cRun,true);
        if(cRun) {
            inactiveStateLastDate = new Date().getTime();
        }
    }
}