import Keyboard from '$active-platform/keyboard';

const {isVisible : isKeybVisible} = Keyboard;

const keyBoardVisibleRef = {current:false};

export const isKeyboardVisible = ()=>{
	if(typeof isKeybVisible =="function") return isKeybVisible();
	return !!keyBoardVisibleRef.current;
}
if(typeof Keyboard.isVisible != "function"){
	Object.defineProperties(Keyboard,{
		isVisible : {value : isKeyboardVisible}
	});
}
export default Keyboard;