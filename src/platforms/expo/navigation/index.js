// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
///au préalable, les packages @react-navigation/native-stack et @react-navigation/native doivent être installés
//import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createNavigationContainerRef } from '@react-navigation/native';

import { createStackNavigator } from '@react-navigation/stack';

export const navigationRef = createNavigationContainerRef();

export const Stack = createStackNavigator()//createNativeStackNavigator();