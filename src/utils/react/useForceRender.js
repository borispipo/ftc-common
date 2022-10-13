import * as React from "react";
import useIsMounted from "./useIsMounted";

export default function useForceRender () {
    const isMounted = useIsMounted();
    const [ , dispatch ] = React.useState(Object.create(null));
    return () => {
        if (isMounted()) {
            dispatch(Object.create(null));
        }
    }
}