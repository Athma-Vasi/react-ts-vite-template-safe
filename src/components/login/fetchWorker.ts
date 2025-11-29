import { None, Ok } from "ts-results";
import { z } from "zod";
import { fetch_timeout_ms } from "../../constants";
import {
    PromiseRejectionError,
    WorkerError,
    WorkerMessageError,
} from "../../errors";
import type { SafeResult } from "../../types";
import {
    createSafeErrorResult,
    parseSyncSafe,
    retryFetchSafe,
} from "../../utils";

// mapping of url to zod schema for decoding json response
// as zod schemas cannot be serialized
const json_schema_decode_table: Record<string, z.ZodType> = {
    // placeholder example for demonstration purposes
    "https://jsonplaceholder.typicode.com/posts/1": z.object({
        userId: z.number(),
        id: z.number(),
        title: z.string(),
        body: z.string(),
    }),
    "https://jsonplaceholder.typicode.com/posts": z.array(
        z.object({
            userId: z.number(),
            id: z.number(),
            title: z.string(),
            body: z.string(),
        }),
    ),
};

type MessageEventLoginFetchWorkerToMain<
    Data = unknown,
> = MessageEvent<SafeResult<Data>>;

type MessageEventMainToLoginFetchWorker = MessageEvent<{
    // url to fetch
    url: string;
    requestInit: RequestInit;
}>;

self.onmessage = async (
    event: MessageEventMainToLoginFetchWorker,
) => {
    if (!event.data) {
        self.postMessage(
            createSafeErrorResult(
                new WorkerMessageError(
                    "No data received in Login Fetch worker message",
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
        const { url, requestInit } = event.data;
        const responseResult = await retryFetchSafe({
            input: url,
            init: requestInit,
            signal,
        });

        if (responseResult.err) {
            self.postMessage(responseResult);
            return;
        }
        const responseMaybe = responseResult.safeUnwrap();
        if (responseMaybe.none) {
            self.postMessage(new Ok(None));
            return;
        }

        const object = responseMaybe.safeUnwrap();
        const schema = json_schema_decode_table[url];
        if (!schema) {
            self.postMessage(
                createSafeErrorResult(
                    new WorkerError(
                        `No schema found for URL: ${url}`,
                    ),
                ),
            );
            return;
        }

        const parsedDataResult = parseSyncSafe({
            object,
            schema,
        });

        self.postMessage(parsedDataResult);
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
    console.error("Unhandled error in Login Fetch worker:", event);
    self.postMessage(
        createSafeErrorResult(
            new WorkerError(
                event,
                "Unhandled error in Login Fetch worker",
            ),
        ),
    );
    return true; // Prevents default logging to console
};

self.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
    console.error(
        "Unhandled promise rejection in Login Fetch worker:",
        event.reason,
    );
    self.postMessage(
        createSafeErrorResult(
            new PromiseRejectionError(
                event.reason,
                "Unhandled promise rejection in Login Fetch worker",
            ),
        ),
    );
});

export type {
    MessageEventLoginFetchWorkerToMain,
    MessageEventMainToLoginFetchWorker,
};
