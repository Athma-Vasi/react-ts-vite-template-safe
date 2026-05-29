import { None } from "ts-results";
import { async_timeout_ms } from "../constants";
import {
    PromiseRejectionError,
    WorkerError,
    WorkerMessageError,
} from "../errors";
import type { AppResult } from "../types";
import {
    createErrorResult,
    createSuccessResult,
    getCachedItemAbortableSafe,
    removeCachedItemAbortableSafe,
    setCachedItemAbortableSafe,
} from "../utils";

type MessageEventForageWorkerToMain<
    Data = unknown,
> = MessageEvent<AppResult<Data>>;

type MessageEventMainToForageWorker<Key = string, Value = unknown> =
    MessageEvent<
        {
            kind: "get";
            payload: [Key];
        } | {
            kind: "set";
            payload: [Key, Value];
        } | {
            kind: "remove";
            payload: [Key];
        }
    >;

{ // block scope for persistent worker state
    type ForageWorkerState = {
        queue: MessageEventMainToForageWorker[];
        isProcessing: boolean;
    };

    const state: ForageWorkerState = {
        queue: [],
        isProcessing: false,
    };

    async function processMessageEvent(
        event: MessageEventMainToForageWorker,
    ): Promise<None> {
        if (!event.data) {
            self.postMessage(
                createErrorResult(
                    new WorkerMessageError(
                        "No data received in forage worker message",
                    ),
                ),
            );
            return None;
        }

        const { abort, signal } = new AbortController();
        const timeout = setTimeout(() => {
            abort();
        }, async_timeout_ms);

        try {
            const { kind, payload } = event.data;

            switch (kind) {
                case "get": {
                    const [key] = payload;
                    const getResult = await getCachedItemAbortableSafe<
                        unknown
                    >(key, signal);
                    self.postMessage(getResult);
                    break;
                }

                case "set": {
                    const [key, value] = payload;
                    await setCachedItemAbortableSafe(
                        key,
                        value,
                        signal,
                    );
                    self.postMessage(createSuccessResult(None));
                    break;
                }

                case "remove": {
                    const [key] = payload;
                    await removeCachedItemAbortableSafe(
                        key,
                        signal,
                    );
                    self.postMessage(createSuccessResult(None));
                    break;
                }

                default: {
                    self.postMessage(
                        createErrorResult(
                            new WorkerMessageError(
                                `Unknown message kind: "${
                                    String(kind)
                                }" received in forage worker`,
                            ),
                        ),
                    );
                    break;
                }
            }
        } catch (error: unknown) {
            self.postMessage(
                createErrorResult(
                    new WorkerError(error),
                ),
            );
        } finally {
            clearTimeout(timeout);
            return None;
        }
    }

    async function handleWorkerMessageEvent(
        event: MessageEventMainToForageWorker,
    ): Promise<None> {
        state.queue.push(event);

        if (state.isProcessing) {
            return None;
        }

        state.isProcessing = true;

        try {
            while (state.queue.length > 0) {
                const currentEvent = state.queue.shift();

                if (!currentEvent) {
                    continue;
                }

                await processMessageEvent(currentEvent);
            }
        } catch (error: unknown) {
            self.postMessage(
                createErrorResult(
                    new WorkerError(error),
                ),
            );
        } finally {
            state.isProcessing = false;
            return None;
        }
    }

    async function handleWorkerErrorEvent(
        event: string | Event,
    ): Promise<None> {
        console.error("Unhandled error in forage worker:", event);
        self.postMessage(
            createErrorResult(
                new WorkerError(
                    event,
                    "Unhandled error in forage worker",
                ),
            ),
        );
        // return true; // Prevents default logging to console
        return None;
    }

    async function handlePromiseRejectionEvent(
        event: PromiseRejectionEvent,
    ): Promise<None> {
        console.error(
            "Unhandled promise rejection in forage worker:",
            event.reason,
        );
        self.postMessage(
            createErrorResult(
                new PromiseRejectionError(
                    event.reason,
                    "Unhandled promise rejection in forage worker",
                ),
            ),
        );
        return None;
    }

    self.onmessage = handleWorkerMessageEvent;
    self.onerror = handleWorkerErrorEvent;

    self.addEventListener(
        "unhandledrejection",
        handlePromiseRejectionEvent,
    );
}

export type { MessageEventForageWorkerToMain, MessageEventMainToForageWorker };
