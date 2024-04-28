import ActivePlatform from "$active-platform";
import * as Platform from "./utils";

export * from "./utils";

export default {
    ...Platform,
    ...ActivePlatform,
    get isExpoUI (){
        return ()=> ActivePlatform.IS_EXPO_UI_APP === true;
    }
};