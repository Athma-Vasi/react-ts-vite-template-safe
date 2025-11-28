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

type MessageEventLoginForageWorkerToMain<
    Data = unknown,
> = MessageEvent<SafeResult<Data>>;

type MessageEventLoginForageMainToWorker = MessageEvent<
    {
        kind: "get";
        payload: string;
    } | {
        kind: "set";
        payload: [string, unknown];
    } | {
        kind: "remove";
        payload: string;
    }
>;

self.onmessage = async (
    event: MessageEventLoginForageMainToWorker,
) => {
    if (!event.data) {
        self.postMessage(
            createSafeErrorResult(
                new WorkerMessageError(
                    "No data received in Login Forage worker message",
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
        const { kind, payload } = event.data;

        switch (kind) {
            case "get": {
                const key = payload;
                const getResult = await getCachedItemAbortableSafe<
                    unknown
                >(key, signal);
                self.postMessage(getResult);
                break;
            }

            case "set": {
                const [key, value] = payload;
                const setResult = await setCachedItemAbortableSafe(
                    key,
                    value,
                    signal,
                );
                self.postMessage(setResult);
                break;
            }

            case "remove": {
                const key = payload;
                const removeResult = await removeCachedItemAbortableSafe(
                    key,
                    signal,
                );
                self.postMessage(removeResult);
                break;
            }

            default: {
                self.postMessage(
                    createSafeErrorResult(
                        new WorkerError(
                            `Unknown kind in Login Forage worker message: ${
                                String(
                                    kind,
                                )
                            }`,
                        ),
                    ),
                );
                break;
            }
        }

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
    console.error("Unhandled error in Login Forage worker:", event);
    self.postMessage(
        createSafeErrorResult(
            new WorkerError(
                event,
                "Unhandled error in Login Forage worker",
            ),
        ),
    );
    return true; // Prevents default logging to console
};

self.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
    console.error(
        "Unhandled promise rejection in Login Forage worker:",
        event.reason,
    );
    self.postMessage(
        createSafeErrorResult(
            new PromiseRejectionError(
                event.reason,
                "Unhandled promise rejection in Login Forage worker",
            ),
        ),
    );
});

export type {
    MessageEventLoginForageMainToWorker,
    MessageEventLoginForageWorkerToMain,
};
