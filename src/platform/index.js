import ActivePlatform from "$active-platform";
import * as Platform from "./utils";

export * from "./utils";

export default {
    ...Platform,
    ...ActivePlatform
};