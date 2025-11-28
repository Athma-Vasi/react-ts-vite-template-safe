import { Suspense, useReducer } from "react";
import { ErrorBoundary } from "react-error-boundary";
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
        initialChildState: Props;
        childComponentState: Record<string, unknown>;
        errorDispatch: React.ActionDispatch<[dispatch: {
            action: "setChildComponentState";
            payload: Record<string, unknown>;
        }]>;
    }>,
) {
    return function ErrorSuspenseHOC(initialChildState: Props) {
        const [
            errorState,
            errorDispatch,
        ] = useReducer(errorReducer, initialErrorState);
        const { childComponentState } = errorState;

        const propsModified = {
            initialChildState,
            childComponentState,
            errorDispatch,
        };

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
