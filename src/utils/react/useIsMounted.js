import { useEffect,useCallback,useRef} from "react";
export default function useIsMounted(){
    const ref = useRef(true);
    useEffect(() => {
        return () => void (ref.current = false);
    }, []);
    return useCallback(() => ref.current, []);
};