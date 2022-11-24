// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.



import S2Out from "$signIn2SignOut";
/*** cette variable sert à personnaliser les fonction d'authentification/connexion signIn et de déconnexion signOut d'un utilisateur côté client */
const SignIn2SignOut = typeof S2Out =='object' && S2Out ? S2Out : {};

export default SignIn2SignOut;