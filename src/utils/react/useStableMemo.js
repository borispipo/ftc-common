import stableHash from 'stable-hash';
import { useMemo } from 'react';

export default function useStableMemo(factory, deps){
    return useMemo(factory, [stableHash(deps)]);
}