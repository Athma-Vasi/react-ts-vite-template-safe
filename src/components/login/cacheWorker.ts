import { WorkerError, WorkerMessageError } from "../../errors";
import type { SafeResult } from "../../types";
import { createSafeErrorResult, createSafeSuccessResult } from "../../utils";

type MessageEventLoginCacheWorkerToMain<
    State extends Record<PropertyKey, unknown> = Record<string, unknown>,
> = MessageEvent<SafeResult<State>>;

type MessageEventLoginCacheMainToWorker<Key = PropertyKey, Value = unknown> =
    MessageEvent<
        | {
            kind: "set";
            payload: [key: Key, value: Value];
        }
        | {
            kind: "sendState";
            payload: [];
        }
    >;

// block scope for persistent worker state
{
    const cache = new Map<string, unknown>();

    self.onmessage = async (
        event: MessageEventLoginCacheMainToWorker,
    ) => {
        if (!event.data) {
            self.postMessage(
                createSafeErrorResult(
                    new WorkerMessageError(
                        "No data received in Login cache worker message",
                    ),
                ),
            );
            return;
        }

        try {
            const { kind, payload } = event.data as {
                kind: string;
                payload: [string, unknown];
            };

            switch (kind) {
                case "set": {
                    const [key, value] = payload;
                    cache.set(String(key), value);
                    break;
                }

                case "sendState": {
                    self.postMessage(
                        createSafeSuccessResult(Object.fromEntries(cache)),
                    );
                    break;
                }

                default: {
                    self.postMessage(
                        createSafeErrorResult(
                            new WorkerMessageError(
                                `Unknown message kind "${kind}" received in Login cache worker`,
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
        }
    };
}

self.onerror = (event: string | Event) => {
    console.error("Unhandled error in Login cache worker:", event);
    self.postMessage(
        createSafeErrorResult(
            new WorkerError(
                event,
                "Unhandled error in Login cache worker",
            ),
        ),
    );
    return true; // Prevents default logging to console
};

export type {
    MessageEventLoginCacheMainToWorker,
    MessageEventLoginCacheWorkerToMain,
};
