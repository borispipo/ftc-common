// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

///la liste des évènements supplémentaires à personnaliser, voir fichier babel.config.alias
import * as appEvents from "$app-events"; 
export * from "$app-events";

export const STATE_CHANGE = 'STATE_CHANGE';

export const STATE_ACTIVE = "STATE_ACTIVE";

export const STATE_INACTIVE = "STATE_INACTIVE";

export const RUN_BACKGROUND_TASKS = "RUN_BACKGROUND_TASKS";

export const GO_ONLINE = "GO_ONLINE";

export const GO_OFFLINE = "GO_OFFLINE";

export const AUTH_TOGGLE_MULTI_USERS = "AUTH_TOGGLE_MULTI_USERS";

export const AUTH_LOGIN_USER = "AUTH_LOGIN_USER";

export const AUTH_LOGOUT_USER= "AUTH_LOGOUT_USER";

export const AUTH_UPSERT_LOGGED_USER = "AUTH_UPSERT_LOGGED_USER";

export const RESIZE_PAGE = "RESIZE_PAGE";

export const PAGE_RESIZE = RESIZE_PAGE;

export const UPDATE_THEME = "UPDATE_THEME";

export const NAVIGATION_SESSION_STATE_CHANGED = "NAVIGATION_SESSION_STATE_CHANGED";
export const BACK_BUTTON = "BACK_BUTTON";

export const TOGGLE_MINIMIZE_DRAWER = "TOGGLE_MINIMIZE_DRAWER";

export const REMOVE_DATABASE = "REMOVE_DATABASE";

export const SCREEN_FOCUS = "SCREEN_FOCUS";

export const SCREEN_BLUR = "SCREEN_BLUR";

export default {
    REMOVE_DATABASE,
    STATE_CHANGE,
    STATE_ACTIVE,
    STATE_INACTIVE,
    RUN_BACKGROUND_TASKS,
    GO_ONLINE,
    GO_OFFLINE,
    AUTH_TOGGLE_MULTI_USERS,
    AUTH_LOGIN_USER,
    AUTH_LOGOUT_USER,
    AUTH_UPSERT_LOGGED_USER,
    RESIZE_PAGE,
    PAGE_RESIZE,
    UPDATE_THEME,
    TOGGLE_MINIMIZE_DRAWER,
    NAVIGATION_SESSION_STATE_CHANGED,
    BACK_BUTTON,
    ...appEvents,
}