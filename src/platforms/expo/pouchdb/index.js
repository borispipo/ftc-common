// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import Label from "$components/Label";
import {View} from "react-native";
import theme from "$theme";
import {isObj} from "$utils";

/**** permet d'afficher le niveau de progression de la synchronisation pouchdb */
export function getSyncProgressPreloaderProps ({pending,title,footer:customFooter,content}){
    const footer = [];
    Object.map(customFooter,(f)=>{
        if(isObj(f)){
            const {action,...rest} = f;
            if(typeof action =='function'){
                footer.push({
                    ...rest,
                    onPress : action,
                })
            } else footer.push(rest);
        }
    })
    return {
        title,
        content : <View style={[theme.styles.row,theme.styles.pl1,theme.styles.flexWrap]}>
            <Label>{content}</Label>
            <Label style={{fontSize:16}} primary textBold>
                {" "+(pending)+"%"}
            </Label>
            <Label>...</Label>
        </View>,
        footer
    }
}
