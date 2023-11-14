import APP from "$capp/instance";
import {isNonNullString,defaultStr,isObj} from "$cutils";
export default function toPdfmakeObj(str,options){
    if(!isNonNullString(str)) return null;
    str = defaultStr(APP.sprintf(str)).trim();
    options = isObj(options)? options : {};
    let bold = false, italics = false,underlined = false;
    const output = [];
    let text = str.split('').reduce((a, b) => {
        if(b == '*'){
            if(bold){
                if(a != ''){
                    if(italics)
                        output.push({...options,text: a, bold: true, italics:true});
                    else
                      output.push({...options,text: a, bold: true});
                }
                bold = false;
            }
            else{
                if(italics)
                    output.push({...options,text: a, italics: true})
                else
                    output.push({...options,text: a})
                bold = true;
            }
            return '';
        }
        else if(b == '_'){
            if(italics){
                if(a != ''){
                    if(bold)
                        output.push({...options,text: a, bold: true, italics:true});
                    else
                      output.push({...options,text: a, italics: true});
                }
                italics = false;
            }
            else{
                if(bold)
                    output.push({...options,text: a, bold: true})
                else
                    output.push({...options,text: a})
                italics = true;
            }
            return '';
        }
        else{
            return a+b;
        }
    }, '');
    if(text != '')
        output.push({...options,text : text});
    return output;
}