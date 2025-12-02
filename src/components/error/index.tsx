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
                await handleMessageFromLoggerWorker({
                    errorDispatch,
                    event,
                    isComponentMountedRef,
                });
            };

            return () => {
                loggerWorker.terminate();
                isComponentMountedRef.current = false;
            };
        }, []);

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

                    if (loggerWorkerMaybe.some) {
                        loggerWorkerMaybe.val.postMessage({
                            url: "/test-url",
                            requestInit: {},
                        });
                    }
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
