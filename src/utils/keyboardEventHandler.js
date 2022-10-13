
import KeyboardEventHandler from 'react-keyboard-event-handler';
if(!React.KeyboardEventHandler){
    Object.defineProperties(React,{
        KeyboardEventHandler : {value : KeyboardEventHandler,override:false,writable:false},
    })
}
export default KeyboardEventHandler;
