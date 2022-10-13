import * as Utils from "./utils";
import * as Remote from "./remote";

import login from "./utils/login";

export * from "./remote";
export * from "./utils";
export {default as login} from "./utils/login";

export default {
    ...Utils,
    ...Remote,
    login,
    loginUser : login,
}
