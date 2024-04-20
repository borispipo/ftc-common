// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import Platform from '$active-platform';

export default function configureFonts(config){
  const fonts = Platform.select({isV3:true, ...config});
  return fonts;
}