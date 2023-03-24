// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import isNonNullString from "$cutils/isNonNullString";

export const structDataDBName = "struct_data";//le nom de la base de données pour les struct-data


export const triggerEventTableName =  (tableName)=>{
    return isNonNullString(tableName)? "STRUCT_DATA/"+tableName : undefined;
}