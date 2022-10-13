import RNPlatform from "$src/platform";
import * as Platform from "./utils";

export * from "./utils";

export default {
    ...Platform,
    ...RNPlatform
};