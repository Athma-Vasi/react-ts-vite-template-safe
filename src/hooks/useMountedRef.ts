import { useEffect, useRef } from "react";

function useMountedRef() {
    const mounted = useRef(false);

    useEffect(() => {
        mounted.current = true;

        return () => {
            mounted.current = false;
        };
    }, []);

    return mounted;
}

export { useMountedRef };
