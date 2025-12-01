import { Suspense, useReducer } from "react";
import { ErrorBoundary } from "react-error-boundary";
import type { ErrorDispatch } from "./dispatches";
import ErrorFallback from "./ErrorFallback";
import { errorReducer } from "./reducers";
import { initialErrorState } from "./state";

function ErrorSuspenseHOC<
    Props extends Record<PropertyKey, unknown> = Record<
        PropertyKey,
        unknown
    >,
>(
    Component: React.ComponentType<{
        // initialChildComponentState: Props;
        childComponentState: Props;
        errorDispatch: React.Dispatch<ErrorDispatch>;
    }>,
) {
    return function ErrorSuspenseHOC(initialChildComponentState: Props) {
        const [
            errorState,
            errorDispatch,
        ] = useReducer(errorReducer, initialErrorState);
        const { childComponentState } = errorState;

        const propsModified = {
            childComponentState: {
                ...initialChildComponentState,
                ...childComponentState,
            },
            errorDispatch,
        };

        console.group("ErrorSuspenseHOC Render");
        console.log("errorState", errorState);
        console.log("propsModified", propsModified);
        console.groupEnd();

        return (
            <ErrorBoundary
                FallbackComponent={ErrorFallback}
                onReset={(details) => {
                    console.group("onReset triggered");
                    console.log("details", details);
                    console.groupEnd();
                }}
                onError={(error, info) => {
                    console.group("onError triggered");
                    console.log("error", error);
                    console.log("info", info);
                    console.groupEnd();
                }}
            >
                <Suspense fallback={<div>Loading...</div>}>
                    <Component {...propsModified} />
                </Suspense>
            </ErrorBoundary>
        );
    };
}

export default ErrorSuspenseHOC;
