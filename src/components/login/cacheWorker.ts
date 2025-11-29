import { WorkerError, WorkerMessageError } from "../../errors";
import type { SafeResult } from "../../types";
import { createSafeErrorResult, createSafeSuccessResult } from "../../utils";

type MessageEventLoginCacheWorkerToMain<
    State extends Record<PropertyKey, unknown> = Record<string, unknown>,
> = MessageEvent<SafeResult<State>>;

type MessageEventLoginCacheMainToWorker<Key = string, Value = unknown> =
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
            const { kind, payload } = event.data;

            switch (kind) {
                case "get": {
                    const [key] = payload;
                    const value = cache.get(String(key));
                    self.postMessage(
                        createSafeSuccessResult(value),
                    );
                    break;
                }

                case "remove": {
                    const [key] = payload;
                    cache.delete(String(key));
                    break;
                }

                case "set": {
                    const [key, value] = payload;
                    cache.set(String(key), value);
                    break;
                }

                case "sendAll": {
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
