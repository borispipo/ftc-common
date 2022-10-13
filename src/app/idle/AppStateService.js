/**
 * Class to allow us to refer to the app state service
 * @see : https://stackoverflow.com/questions/50565458/app-state-in-react-native-does-not-remove-the-listener
 */
import APP from "$app";
const isStateInactive = x => x && typeof x =="string" ? x.match(/inactive|background/) ? true : false  : false;
const isStateActive = x => x =="active";
 export default class AppStateService {

    static instance;

    static STATE_ACTIVE         = 'active';
    static STATE_INACTIVE       = 'inactive';
    static STATE_BACKGROUND     = 'background';
    static STATE_NOT_LAUNCHED   = 'not_launched';

    previousState   = AppStateService.STATE_NOT_LAUNCHED;
    currentState    = AppStateService.STATE_ACTIVE;

    handlers = {};

    appLaunchId = 0;

    /**
     * @returns {AppStateService}
     */
    static getInstance() {
        if(!this.instance){
            this.instance = new AppStateService();
        }

        return this.instance;
    }

    static init = () => {
        // This func need to be call in the App.js, it's just here to create the instance
        const instance = AppStateService.getInstance();

        instance.appLaunchId = new Date().getTime() / 1000;
    }

    handleAppStateChange = (nextState) => {
        if(nextState !== this.currentState) {
            this.previousState = this.currentState;
            this.currentState = nextState;
            let isInactive = isStateInactive(nextState);
            let isActive = isStateActive(nextState);
            const arg = {isActive,isInactive,nextState,next:nextState,previous:this.previousState,current:this.currentState,previousState:this.previousState,currentState:this.currentState};
            let previousState = this.previousState && typeof this.previousState == "string" ? this.previousState : ''
            APP.trigger(APP.EVENTS.STATE_CHANGE,arg);
            if (isStateInactive(previousState) && nextState === 'active') {
                if(typeof APP.onStateBecomeActive =='function') APP.onStateBecomeActive(arg);
            } else if(previousState =="active" && typeof APP.onStateBecomeInactive =='function'){
                APP.onStateBecomeInactive(arg);
            }
            for (const [key, handler] of Object.entries(this.handlers)) {
                handler(arg);
            }
        }
    }

    getCurrentState = () => {
        return this.currentState;
    }

    getPreviousState = () => {
        return this.previousState;
    }

    addStateHandler = (key, handler) => {
        this.handlers[key] = handler;
    }

    hasStateHandler = (key) => {
        if( this.handlers[key] ){
            return true;
        }

        return false;
    }

    removeStateHandler = (key) => {
        delete this.handlers[key];
    }
}