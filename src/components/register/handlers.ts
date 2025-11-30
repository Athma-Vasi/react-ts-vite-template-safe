import React from "react";
import { None, Some } from "ts-results";
import { WorkerMessageHandlerError } from "../../errors";
import { createSafeErrorResult } from "../../utils";
import type { MessageEventFetchWorkerToMain } from "../../workers/fetchWorker";
import type { MessageEventForageWorkerToMain } from "../../workers/forageWorker";
import type { ErrorDispatch } from "../error/dispatches";
import { registerActions } from "./actions";
import type { RegisterDispatch } from "./dispatches";

async function handleMessageFromForageWorker(
    { errorDispatch, event, isComponentMountedRef, registerDispatch }: {
        errorDispatch: React.Dispatch<ErrorDispatch>;
        event: MessageEventForageWorkerToMain;
        isComponentMountedRef: React.RefObject<boolean>;
        registerDispatch: React.Dispatch<RegisterDispatch>;
    },
) {
    if (!isComponentMountedRef.current) {
        return;
    }

    const { data } = event;

    console.group("handleMessageFromForageWorker");
    console.log("data", data);
    console.groupEnd();
}

async function handleMessageFromCacheWorker(
    { errorDispatch, event, isComponentMountedRef, registerDispatch }: {
        errorDispatch: React.Dispatch<ErrorDispatch>;
        event: MessageEventForageWorkerToMain;
        isComponentMountedRef: React.RefObject<boolean>;
        registerDispatch: React.Dispatch<RegisterDispatch>;
    },
) {
    if (!isComponentMountedRef.current) {
        return;
    }

    const { data } = event;

    console.group("handleMessageFromCacheWorker");
    console.log("data", data);
    console.groupEnd();
}

async function handleMessageFromFetchWorker(
    { errorDispatch, event, isComponentMountedRef, registerDispatch }: {
        errorDispatch: React.Dispatch<ErrorDispatch>;
        event: MessageEventFetchWorkerToMain;
        isComponentMountedRef: React.RefObject<boolean>;
        registerDispatch: React.Dispatch<RegisterDispatch>;
    },
): Promise<None> {
    if (!isComponentMountedRef.current) {
        return None;
    }

    try {
        const { data } = event;

        if (data.err) {
            registerDispatch({
                action: registerActions.setSafeErrorMaybe,
                payload: Some(data),
            });
            return None;
        }
        const dataMaybe = data.val;
        if (dataMaybe.none) {
            registerDispatch({
                action: registerActions.setResponseDataMaybe,
                payload: Some([]),
            });
            return None;
        }

        const responseData = dataMaybe.val;

        registerDispatch({
            action: registerActions.setIsLoading,
            payload: false,
        });

        registerDispatch({
            action: registerActions.setResponseDataMaybe,
            payload: Some(
                Array.isArray(responseData) ? responseData : [responseData],
            ),
        });
        return None;
    } catch (error) {
        registerDispatch({
            action: registerActions.setSafeErrorMaybe,
            payload: Some(
                createSafeErrorResult(
                    new WorkerMessageHandlerError(
                        error,
                        "Error handling message from Fetch Worker",
                    ),
                ),
            ),
        });
        return None;
    }
}

export {
    handleMessageFromCacheWorker,
    handleMessageFromFetchWorker,
    handleMessageFromForageWorker,
};
