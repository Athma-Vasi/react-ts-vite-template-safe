import React from "react";
import type { ErrorDispatch } from "../error/dispatches";
import type { RegisterDispatch } from "./dispatches";
import type { MessageEventRegisterForageWorkerToMain } from "./forageWorker";

async function handleMessageFromForageWorker(
    { errorDispatch, event, isComponentMountedRef, RegisterDispatch }: {
        errorDispatch: React.Dispatch<ErrorDispatch>;
        event: MessageEventRegisterForageWorkerToMain;
        isComponentMountedRef: React.RefObject<boolean>;
        RegisterDispatch: React.Dispatch<RegisterDispatch>;
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
    { errorDispatch, event, isComponentMountedRef, RegisterDispatch }: {
        errorDispatch: React.Dispatch<ErrorDispatch>;
        event: MessageEventRegisterForageWorkerToMain;
        isComponentMountedRef: React.RefObject<boolean>;
        RegisterDispatch: React.Dispatch<RegisterDispatch>;
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
    { errorDispatch, event, isComponentMountedRef, RegisterDispatch }: {
        errorDispatch: React.Dispatch<ErrorDispatch>;
        event: MessageEventRegisterForageWorkerToMain;
        isComponentMountedRef: React.RefObject<boolean>;
        RegisterDispatch: React.Dispatch<RegisterDispatch>;
    },
) {
    if (!isComponentMountedRef.current) {
        return;
    }

    const { data } = event;

    console.group("handleMessageFromFetchWorker");
    console.log("data", data);
    console.groupEnd();
}

export {
    handleMessageFromCacheWorker,
    handleMessageFromFetchWorker,
    handleMessageFromForageWorker,
};
