import { fetch_timeout_ms } from "../../constants";
import { WorkerError, WorkerMessageError } from "../../errors";
import type { SafeResult } from "../../types";
import { createSafeErrorResult, createSafeSuccessResult } from "../../utils";

type MessageEventLoggerWorkerToMain<Data = unknown> = MessageEvent<
    SafeResult<Data>
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
            createSafeErrorResult(
                new WorkerMessageError(
                    "No data received in cache worker message",
                ),
            ),
        );
        return;
    }

    try {
        const { abort, signal } = new AbortController();
        const timeout = setTimeout(() => {
            abort();
        }, fetch_timeout_ms);

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
            createSafeSuccessResult("Logger worker received message"),
        );
        clearTimeout(timeout);
        return;
    } catch (error: unknown) {
        self.postMessage(
            createSafeErrorResult(
                new WorkerError(error),
            ),
        );
    }
};

self.onerror = (event: string | Event) => {
    console.error("Unhandled error in cache worker:", event);
    self.postMessage(
        createSafeErrorResult(
            new WorkerError(
                event,
                "Unhandled error in cache worker",
            ),
        ),
    );
    return true; // Prevents default logging to console
};

export type { MessageEventLoggerWorkerToMain, MessageEventMainToLoggerWorker };
