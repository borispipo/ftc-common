// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

export const isValidCurrency = (obj)=> obj && typeof obj =='object' && !Array.isArray(obj) && obj.name && typeof obj.name =="string" && obj.symbol && typeof obj.symbol =="string" && true || false;