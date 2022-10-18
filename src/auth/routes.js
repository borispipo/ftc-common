// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

///les variables d'environnements AUTH_SIGN_IN_ROUTE doit être définie, pour une route personnalisée si l'on veut personaliser la route d'authentification distante
export const SIGN_IN = process.env.AUTH_SIGN_IN_ROUTE || "/auth/signin";

export const LOGIN = SIGN_IN;

export const SIGN_OUT = process.env.AUTH_SIGN_OUT_ROUTE || "/auth/signout";

export const LOG_OUT = SIGN_OUT;

export default {SIGN_IN,SIGN_OUT,LOGIN,LOG_OUT}