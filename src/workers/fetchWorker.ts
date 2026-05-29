import { None } from "ts-results";
import { z } from "zod";
import { response_data_schema } from "../components/register/dispatches";
import { fetch_timeout_ms } from "../constants";
import {
    PromiseRejectionError,
    WorkerError,
    WorkerMessageError,
} from "../errors";
import type { AppResult } from "../types";
import {
    createErrorResult,
    createSuccessResult,
    parseSyncSafe,
    retryFetchSafe,
} from "../utils";

// mapping of url to zod schema for decoding json response
// as zod schemas cannot be serialized
const json_schema_decode_table: Record<string, z.ZodType> = {
    // placeholder example for demonstration purposes
    "https://jsonplaceholder.typicode.com/posts/1": response_data_schema,
    "https://jsonplaceholder.typicode.com/posts": response_data_schema,
};

type MessageEventFetchWorkerToMain<
    Data = unknown,
> = MessageEvent<AppResult<Data>>;

type MessageEventMainToFetchWorker = MessageEvent<{
    // url to fetch
    url: string;
    requestInit: RequestInit;
}>;

{ // block scope for persistent worker state
    type FetchWorkerState = {
        queue: MessageEventMainToFetchWorker[];
        isProcessing: boolean;
    };

    const state: FetchWorkerState = {
        queue: [],
        isProcessing: false,
    };

    async function processMessageEvent(
        event: MessageEventMainToFetchWorker,
    ): Promise<None> {
        if (!event.data) {
            self.postMessage(
                createErrorResult(
                    new WorkerMessageError(
                        "No data received in fetch worker message",
                    ),
                ),
            );
            return None;
        }

        const { abort, signal } = new AbortController();
        const timeout = setTimeout(() => {
            abort();
        }, fetch_timeout_ms);

        try {
            const { url, requestInit } = event.data;
            const responseResult = await retryFetchSafe({
                input: url,
                init: requestInit,
                signal,
            });

            if (responseResult.err) {
                self.postMessage(responseResult);
                return None;
            }

            const responseMaybe = responseResult.safeUnwrap();
            if (responseMaybe.none) {
                self.postMessage(createSuccessResult(None));
                return None;
            }

            const object = responseMaybe.safeUnwrap();
            const schema = json_schema_decode_table[url];

            if (!schema) {
                self.postMessage(
                    createErrorResult(
                        new WorkerError(
                            `No schema found for URL: ${String(url)}`,
                        ),
                    ),
                );
                return None;
            }

            const parsedDataResult = parseSyncSafe({
                object,
                schema,
            });

            self.postMessage(parsedDataResult);
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
        event: MessageEventMainToFetchWorker,
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

    async function handleWorkerMessageError(
        event: string | Event,
    ): Promise<None> {
        console.error("Unhandled error in fetch worker:", event);
        self.postMessage(
            createErrorResult(
                new WorkerError(
                    event,
                    "Unhandled error in fetch worker",
                ),
            ),
        );
        // return true; // Prevents default logging to console
        return None;
    }

    async function handleWorkerPromiseRejection(
        event: PromiseRejectionEvent,
    ): Promise<None> {
        console.error(
            "Unhandled promise rejection in fetch worker:",
            event.reason,
        );
        self.postMessage(
            createErrorResult(
                new PromiseRejectionError(
                    event.reason,
                    "Unhandled promise rejection in fetch worker",
                ),
            ),
        );
        return None;
    }

    self.onmessage = handleWorkerMessageEvent;
    self.onerror = handleWorkerMessageError;

    self.addEventListener(
        "unhandledrejection",
        handleWorkerPromiseRejection,
    );
}

export type { MessageEventFetchWorkerToMain, MessageEventMainToFetchWorker };
