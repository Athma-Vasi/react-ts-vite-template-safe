import { fetch_timeout_ms } from "../../constants";
import { WorkerError, WorkerMessageError } from "../../errors";
import type { AppResult } from "../../types";
import { createErrorResult, createSuccessResult } from "../../utils";

type MessageEventLoggerWorkerToMain<Data = unknown> = MessageEvent<
    AppResult<Data>
>;

type MessageEventMainToLoggerWorker = MessageEvent<
    {
        // url to fetch
        url: string;
        requestInit: RequestInit;
    }
>;

self.onmessage = async (
    event: MessageEventMainToLoggerWorker,
) => {
    if (!event.data) {
        self.postMessage(
            createErrorResult(
                new WorkerMessageError(
                    "No data received in cache worker message",
                ),
            ),
        );
        return;
    }

    const { abort, signal } = new AbortController();
    const timeout = setTimeout(() => {
        abort();
    }, fetch_timeout_ms);

    try {
        // const { url, requestInit } = event.data;
        // const responseResult = await retryFetchSafe({
        //     input: url,
        //     init: requestInit,
        //     signal,
        // });

        // self.postMessage(responseResult);
        // clearTimeout(timeout);
        // return;

        self.postMessage(
            createSuccessResult("Logger worker received message"),
        );
        clearTimeout(timeout);
        return;
    } catch (error: unknown) {
        self.postMessage(
            createErrorResult(
                new WorkerError(error),
            ),
        );
    }
};

self.onerror = (event: string | Event) => {
    console.error("Unhandled error in cache worker:", event);
    self.postMessage(
        createErrorResult(
            new WorkerError(
                event,
                "Unhandled error in cache worker",
            ),
        ),
    );
    return true; // Prevents default logging to console
};

export type { MessageEventLoggerWorkerToMain, MessageEventMainToLoggerWorker };
