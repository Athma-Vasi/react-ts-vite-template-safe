import { async_timeout_ms } from "../../constants";
import {
    PromiseRejectionError,
    WorkerError,
    WorkerMessageError,
} from "../../errors";
import type { SafeResult } from "../../types";
import {
    createSafeErrorResult,
    getCachedItemAbortableSafe,
    removeCachedItemAbortableSafe,
    setCachedItemAbortableSafe,
} from "../../utils";

const async_functions_reference_table: Record<string, Function> = {
    "getCachedItemAbortableSafe": getCachedItemAbortableSafe,
    "removeCachedItemAbortableSafe": removeCachedItemAbortableSafe,
    "setCachedItemAbortableSafe": setCachedItemAbortableSafe,
};

type MessageEventLoginAsyncWorkerToMain<
    Data = unknown,
> = MessageEvent<SafeResult<Data>>;

type MessageEventLoginAsyncMainToWorker<Name = string, Arg = Array<unknown>> =
    MessageEvent<
        [functionName: Name, functionArg: Arg]
    >;

self.onmessage = async (
    event: MessageEventLoginAsyncMainToWorker,
) => {
    if (!event.data) {
        self.postMessage(
            createSafeErrorResult(
                new WorkerMessageError(
                    "No data received in Login Async worker message",
                ),
            ),
        );
        return;
    }

    const { abort, signal } = new AbortController();
    const timeout = setTimeout(() => {
        abort();
    }, async_timeout_ms);

    try {
        const [functionName, functionArg] = event.data;
        const func = async_functions_reference_table[functionName];

        if (typeof func !== "function") {
            self.postMessage(
                createSafeErrorResult(
                    new WorkerError(
                        `Function "${functionName}" not found in Login Async worker`,
                    ),
                ),
            );
            return;
        }

        const result = await func([...functionArg, signal]);
        self.postMessage(result);
        return;
    } catch (error: unknown) {
        self.postMessage(
            createSafeErrorResult(
                new WorkerError(error),
            ),
        );
    } finally {
        clearTimeout(timeout);
    }
};

self.onerror = (event: string | Event) => {
    console.error("Unhandled error in Login Async worker:", event);
    self.postMessage(
        createSafeErrorResult(
            new WorkerError(
                event,
                "Unhandled error in Login Async worker",
            ),
        ),
    );
    return true; // Prevents default logging to console
};

self.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
    console.error(
        "Unhandled promise rejection in Login Async worker:",
        event.reason,
    );
    self.postMessage(
        createSafeErrorResult(
            new PromiseRejectionError(
                event.reason,
                "Unhandled promise rejection in Login Async worker",
            ),
        ),
    );
});

export type {
    MessageEventLoginAsyncMainToWorker,
    MessageEventLoginAsyncWorkerToMain,
};
