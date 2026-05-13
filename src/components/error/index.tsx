import { Suspense, useEffect, useReducer } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Some } from "ts-results";
import { useMountedRef } from "../../hooks/useMountedRef";
import type { ErrorDispatch } from "./dispatches";
import ErrorFallback from "./ErrorFallback";
import { handleMessageFromLoggerWorker } from "./handlers";
import { type MessageEventLoggerWorkerToMain } from "./loggerWorker";
import LoggerWorker from "./loggerWorker?worker";
import { errorReducer } from "./reducers";
import { initialErrorState } from "./state";

// Wraps a component with shared error handling, worker-backed logging, and suspense support.
function ErrorSuspenseHOC<
    Props extends Record<PropertyKey, unknown> = Record<
        PropertyKey,
        unknown
    >,
>(
    Component: React.ComponentType<{
        childComponentState: Props;
        errorDispatch: React.Dispatch<ErrorDispatch>;
    }>,
) {
    return function ErrorSuspenseHOC(initialChildComponentState: Props) {
        const [
            errorState,
            errorDispatch,
        ] = useReducer(errorReducer, initialErrorState);
        const { childComponentState, loggerWorkerMaybe } = errorState;

        const isComponentMountedRef = useMountedRef();

        useEffect(() => {
            // Initialize the logger worker exactly once for this mounted wrapper instance.
            if (loggerWorkerMaybe.some) {
                return;
            }

            const loggerWorker = new LoggerWorker();
            errorDispatch({
                action: "setLoggerWorkerMaybe",
                payload: Some(loggerWorker),
            });
            loggerWorker.onmessage = async (
                event: MessageEventLoggerWorkerToMain,
            ) => {
                // Route worker messages through a single handler to keep side effects centralized.
                await handleMessageFromLoggerWorker({
                    errorDispatch,
                    event,
                    isComponentMountedRef,
                });
            };

            return () => {
                // Ensure the worker is torn down to prevent leaks and stale callbacks.
                loggerWorker.terminate();
                isComponentMountedRef.current = false;
            };
        }, []);

        // Allow reducer-driven state to override the initial child state as updates arrive.
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

                    if (loggerWorkerMaybe.some) {
                        // Forward error context to the logging worker for async processing.
                        loggerWorkerMaybe.val.postMessage({
                            url: "/test-url",
                            requestInit: {},
                        });
                    }
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
