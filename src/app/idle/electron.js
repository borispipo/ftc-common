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