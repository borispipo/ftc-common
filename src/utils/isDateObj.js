// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

export default function isDateObj(dateObj){
    if(!dateObj) return false;
	if(dateObj instanceof Date) return true;
    if(typeof dateObj.getTime != 'function') return false;
    return !(Object.prototype.toString.call(dateObj) !== '[object Date]' || isNaN(dateObj.getTime()));
}