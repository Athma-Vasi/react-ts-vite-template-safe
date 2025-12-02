import { useEffect } from "react";
import type { Err } from "ts-results";
import { type AppErrorBase } from "../../errors";

type ErrorFallbackProps = {
    error: Err<AppErrorBase>;
    resetErrorBoundary: () => void;
};

function ErrorFallback({
    error,
    resetErrorBoundary,
}: ErrorFallbackProps) {
    // Automatically reset the error boundary when this component is mounted
    useEffect(() => {
        resetErrorBoundary();
    }, []);

    console.log("ErrorFallback rendered with error:", error);

    return null;

    // if (error.ok) {
    //     return (
    //         <div className="error-fallback" role="alert">
    //             <h2>Unexpected Error Format</h2>
    //             <pre>{JSON.stringify(error.val, null, 2)}</pre>
    //             <button onClick={resetErrorBoundary}>
    //                 Try again
    //             </button>
    //         </div>
    //     );
    // }

    // const safeError = error.val;
    // const { message, errorKind, name, stack, status, timestamp } = safeError;

    // return (
    //     <div
    //         className="error-fallback"
    //         role="alert"
    //     >
    //         <h2>{`Name: ${name}`}</h2>
    //         <h3>{`Error Kind: ${errorKind}`}</h3>
    //         <pre>{`Message: ${message}`}</pre>
    //         <pre>{`Status: ${status.none?"Unavailable": status.val}`}</pre>
    //         <pre>{`Timestamp: ${timestamp}`}</pre>
    //         <pre>{`Stack Trace: ${stack}`}</pre>
    //         <button onClick={resetErrorBoundary}>
    //             Try again
    //         </button>
    //     </div>
    // );
}

export default ErrorFallback;
