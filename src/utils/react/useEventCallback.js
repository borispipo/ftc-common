import { useLayoutEffect, useMemo, useRef } from 'react';
/**** 
    @see : https://www.npmjs.com/package/use-event-callback
    @see : https://github.com/facebook/react/issues/14099
*/
const useEventCallback = (fn) => {
    let ref = useRef(fn);
    useLayoutEffect(() => {
        ref.current = fn;
    });
    return useMemo(() => (...args) => {
        const { current } = ref;
        return current(...args);
    }, []);
};
export default useEventCallback;