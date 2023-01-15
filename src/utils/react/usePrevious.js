import * as React from "react";

const refEquality = (a, b) => a === b;

export default function usePrevious(value,compareFn) {
    const ref = React.useRef(value);
    const fn = typeof compareFn =='function' ? compareFn :  refEquality;
    React.useEffect(() => {
        if (!fn(ref.current, value)) {
            ref.current = value;
        }
    }, [value]); // Only re-run if value changes
    return ref.current;
}

/**
 * usePreviousDifferent hook for React
 * It returns the past value which was different from the current one.
 *
 * @param currentValue The value whose previously different value is to be tracked
 * @returns The previous value
 */
export function usePreviousDifferent(currentValue,compareFn){
    const previousRef = React.useRef(currentValue);
    const previousRef2 = React.useRef(currentValue);
    const fn = typeof compareFn =='function' ? compareFn :  refEquality;
    React.useEffect(() => {
      previousRef2.current = previousRef.current;
      previousRef.current = currentValue;
    }, [currentValue]);
  
    return fn(currentValue,previousRef.current) ? previousRef2.current : previousRef.current;
  }