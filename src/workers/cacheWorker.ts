import { None, Ok } from "ts-results";
import { WorkerError, WorkerMessageError } from "../errors";
import type { AppResult } from "../types";
import { createAppErrorResult, createSafeSuccessResult } from "../utils";

type MessageEventCacheWorkerToMain<Data = unknown> = MessageEvent<
    AppResult<Data>
>;

type MessageEventMainToCacheWorker<Key = string, Value = unknown> =
    MessageEvent<
        | {
            kind: "get";
            payload: [Key];
        }
        | {
            kind: "set";
            payload: [Key, Value];
        }
        | {
            kind: "remove";
            payload: [Key];
        }
        | {
            kind: "sendAll";
            payload: [];
        }
    >;

// block scope for persistent worker state
{
    type CacheWorkerState = {
        cache: Map<string, unknown>;
        queue: MessageEventMainToCacheWorker[];
        isProcessing: boolean;
    };

    const state: CacheWorkerState = {
        cache: new Map(),
        queue: [],
        isProcessing: false,
    };

    self.onmessage = async (
        event: MessageEventMainToCacheWorker,
    ) => {
        try {
            state.queue.push(event);

            if (state.isProcessing) {
                return;
            }

            state.isProcessing = true;

            while (state.queue.length > 0) {
                const currentEvent = state.queue.shift();
                if (!currentEvent?.data) {
                    self.postMessage(
                        createAppErrorResult(
                            new WorkerMessageError(
                                "No data received in cache worker message",
                            ),
                        ),
                    );
                    return;
                }

                const { data } = currentEvent;
                const { kind, payload } = data;

                switch (kind) {
                    case "get": {
                        const [key] = payload;
                        const value = state.cache.get(String(key));
                        self.postMessage(
                            createSafeSuccessResult(value),
                        );
                        break;
                    }

                    case "remove": {
                        const [key] = payload;
                        state.cache.delete(String(key));
                        self.postMessage(
                            new Ok(None),
                        );
                        break;
                    }

                    case "set": {
                        const [key, value] = payload;
                        state.cache.set(String(key), value);
                        self.postMessage(
                            new Ok(None),
                        );
                        break;
                    }

                    case "sendAll": {
                        self.postMessage(
                            createSafeSuccessResult(
                                Object.fromEntries(state.cache),
                            ),
                        );
                        break;
                    }

                    default: {
                        self.postMessage(
                            createAppErrorResult(
                                new WorkerMessageError(
                                    `Unknown message kind: "${
                                        String(kind)
                                    }" received in cache worker`,
                                ),
                            ),
                        );
                        break;
                    }
                }
            }

            state.isProcessing = false;
            return;
        } catch (error: unknown) {
            self.postMessage(
                createAppErrorResult(
                    new WorkerError(error),
                ),
            );
        }
    };
}

self.onerror = (event: string | Event) => {
    console.error("Unhandled error in cache worker:", event);
    self.postMessage(
        createAppErrorResult(
            new WorkerError(
                event,
                "Unhandled error in cache worker",
            ),
        ),
    );
    return true; // Prevents default logging to console
};

export type { MessageEventCacheWorkerToMain, MessageEventMainToCacheWorker };
