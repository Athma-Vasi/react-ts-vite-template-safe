import React from "react";
import type { ErrorDispatch } from "../error/dispatches";
import type { LoginDispatch } from "./dispatches";
import type { MessageEventLoginForageWorkerToMain } from "./forageWorker";

async function handleMessageFromForageWorker(
    { errorDispatch, event, isComponentMountedRef, loginDispatch }: {
        errorDispatch: React.Dispatch<ErrorDispatch>;
        event: MessageEventLoginForageWorkerToMain;
        isComponentMountedRef: React.RefObject<boolean>;
        loginDispatch: React.Dispatch<LoginDispatch>;
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
    { errorDispatch, event, isComponentMountedRef, loginDispatch }: {
        errorDispatch: React.Dispatch<ErrorDispatch>;
        event: MessageEventLoginForageWorkerToMain;
        isComponentMountedRef: React.RefObject<boolean>;
        loginDispatch: React.Dispatch<LoginDispatch>;
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
    { errorDispatch, event, isComponentMountedRef, loginDispatch }: {
        errorDispatch: React.Dispatch<ErrorDispatch>;
        event: MessageEventLoginForageWorkerToMain;
        isComponentMountedRef: React.RefObject<boolean>;
        loginDispatch: React.Dispatch<LoginDispatch>;
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
