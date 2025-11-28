import localforage from "localforage";
import type { Option } from "ts-results";
import { Err, ErrImpl, None, Ok, Some } from "ts-results";
import z, {
    ZodArray,
    ZodBoolean,
    ZodCustom,
    ZodEnum,
    ZodLiteral,
    ZodNullable,
    ZodNumber,
    ZodObject,
    ZodRecord,
    ZodString,
    ZodUnknown,
} from "zod";
import type { $strip } from "zod/v4/core";
import {
    AppErrorBase,
    CacheError,
    JSONError,
    NetworkError,
    ParseError,
    PromiseAbortedError,
} from "./errors";
import type { SafeError, SafeResult } from "./types";

function createSafeSuccessResult<Data = unknown>(
    data: Data,
): Ok<Option<NonNullable<Data>>> {
    return new Ok(data == null ? None : Some(data));
}

function createSafeErrorResult(
    error: unknown,
): Err<SafeError> {
    if (error instanceof Error) {
        return new Err({
            message: error.message == null ? "Unknown error" : error.message,
            name: error.name == null ? "Error" : error.name,
            original: Some(error.toString()),
            stack: error.stack == null ? None : Some(error.stack),
            status: None,
            timestamp: new Date().toISOString(),
        });
    }

    if (typeof error === "string") {
        return new Err({
            message: error,
            name: "Error",
            original: Some(error),
            stack: None,
            status: None,
            timestamp: new Date().toISOString(),
        });
    }

    function serializeSafe(data: unknown): Option<string> {
        try {
            const serializedData = JSON.stringify(data, null, 2);
            return Some(serializedData);
        } catch (_error: unknown) {
            return Some("Unserializable data");
        }
    }

    if (error instanceof Event) {
        if (error instanceof PromiseRejectionEvent) {
            return new Err({
                message: error.reason.toString() ?? "",
                name: `PromiseRejectionEvent: ${error.type}`,
                original: serializeSafe(error),
                stack: None,
                status: None,
                timestamp: new Date().toISOString(),
            });
        }

        return new Err({
            message: error.timeStamp.toString() ?? "",
            name: `EventError: ${error.type}`,
            original: serializeSafe(error),
            stack: None,
            status: None,
            timestamp: new Date().toISOString(),
        });
    }

    if (error instanceof AppErrorBase) {
        return new Err({
            message: error.message,
            name: error.name,
            original: None,
            stack: error.stack ? Some(error.stack) : None,
            status: error.status,
            timestamp: error.timestamp,
        });
    }

    return new Err({
        message: "You've seen it before.🪞 Déjà vu. Something's off...",
        name: "👾 SimulationDysfunction",
        original: serializeSafe(error),
        stack: None,
        status: None,
        timestamp: new Date().toISOString(),
    });
}

function parseSyncSafe<Output = unknown>(
    { object, schema }: {
        object: Output;
        schema: z.ZodType;
    },
): SafeResult<Output> {
    try {
        const { data, error, success } = Array.isArray(object)
            ? z.array(schema).safeParse(object)
            : schema.safeParse(object);

        return success
            ? createSafeSuccessResult(data as Output)
            : createSafeErrorResult(
                new ParseError(
                    `Failed to parse object: ${error.message}`,
                ),
            );
    } catch (error_: unknown) {
        return createSafeErrorResult(
            new ParseError(
                error_,
                `Exception thrown during parse of object:
                ${JSON.stringify(object, null, 2) ?? "unknown object"}`,
            ),
        );
    }
}

function parseDispatchAndSetState<
    Payload extends
        | ZodString
        | ZodBoolean
        | ZodNumber
        | ZodArray
        | ZodEnum
        | ZodNullable<ZodCustom<Worker, Worker>>
        | ZodCustom<Worker, Worker>
        | ZodCustom<FormData, FormData>
        | ZodNullable<ZodCustom<ErrImpl<unknown>, ErrImpl<unknown>>>
        | ZodRecord<ZodString, ZodUnknown>
        | ZodObject = any,
    Dispatch extends { action: string; payload: unknown } = {
        action: string;
        payload: unknown;
    },
    State extends Record<PropertyKey, unknown> = Record<PropertyKey, unknown>,
>(
    { dispatch, key, state, schema }: {
        dispatch: Dispatch;
        schema: ZodObject<
            {
                action: ZodLiteral<string>;
                payload: Payload;
            },
            $strip
        >;
        state: State;
        key: keyof State;
    },
): State {
    const parsedDispatchResult = parseSyncSafe(
        {
            object: dispatch,
            schema,
        },
    );
    if (parsedDispatchResult.err) {
        return state;
    }
    const parsedDispatchMaybe = parsedDispatchResult.safeUnwrap();
    if (parsedDispatchMaybe.none) {
        return state;
    }
    const parsedDispatch = parsedDispatchMaybe.safeUnwrap();

    return {
        ...state,
        [key]: parsedDispatch.payload as State[typeof key],
    };
}

// Helper function to make any promise abortable
function makeAbortable<Data = unknown>(
    promise: Promise<Data>,
    signal: AbortSignal,
): Promise<Data> {
    return Promise.race([
        promise,
        new Promise<never>((_, reject) => {
            if (signal.aborted) {
                reject(
                    new PromiseAbortedError(),
                );
            }

            signal.addEventListener("abort", () => {
                reject(
                    new PromiseAbortedError(),
                );
            });
        }),
    ]);
}

async function getCachedItemAbortableSafe<Data = unknown>(
    key: string,
    signal: AbortSignal,
): Promise<SafeResult<Data>> {
    if (signal.aborted) {
        return createSafeErrorResult(
            new PromiseAbortedError(
                "getCachedItemAbortableSafe aborted before start",
            ),
        );
    }

    try {
        const cacheOperation = localforage.getItem<Data>(key);
        const data = await makeAbortable(cacheOperation, signal);
        return createSafeSuccessResult(data);
    } catch (error: unknown) {
        return createSafeErrorResult(
            new CacheError(error, `Failed to get cached item for key: ${key}`),
        );
    }
}

async function setCachedItemAbortableSafe<Data = unknown>(
    key: string,
    value: Data,
    signal: AbortSignal,
): Promise<SafeResult> {
    if (signal.aborted) {
        return createSafeErrorResult(
            new PromiseAbortedError(
                "setCachedItemAbortableSafe aborted before start",
            ),
        );
    }

    try {
        const cacheOperation = localforage.setItem<Data>(key, value);
        await makeAbortable(cacheOperation, signal);
        return new Ok(None);
    } catch (error: unknown) {
        return createSafeErrorResult(
            new CacheError(error, `Failed to set cached item for key: ${key}`),
        );
    }
}

async function removeCachedItemAbortableSafe(
    key: string,
    signal: AbortSignal,
): Promise<SafeResult> {
    if (signal.aborted) {
        return createSafeErrorResult(
            new PromiseAbortedError(
                "removeCachedItemAbortableSafe aborted before start",
            ),
        );
    }

    try {
        const cacheOperation = localforage.removeItem(key);
        await makeAbortable(cacheOperation, signal);
        return new Ok(None);
    } catch (error: unknown) {
        return createSafeErrorResult(
            new CacheError(
                error,
                `Failed to remove cached item for key: ${key}`,
            ),
        );
    }
}

type RetryOptions = {
    backOffFactor?: number;
    retries?: number;
    delayMs?: number;
};
async function retryFetchSafe<
    Data = unknown,
>(
    { init, input, retryOptions, signal }: {
        init: RequestInit;
        input: RequestInfo | URL;
        retryOptions?: RetryOptions;
        signal: AbortSignal | undefined;
    },
): Promise<SafeResult<Data>> {
    const {
        backOffFactor = 2,
        retries = 3,
        delayMs = 1000,
    } = retryOptions ?? {};

    async function tryAgain(
        attempt: number,
    ): Promise<SafeResult<Data>> {
        try {
            const response: Response = await fetch(input, {
                ...init,
                signal,
            });
            if (response == null) {
                // perhaps a network-level failure occurred before any HTTP response could be received
                // trigger a retry
                throw new NetworkError("Response is null or undefined");
            }

            try {
                const data = await response.json();
                if (data == null) {
                    // trigger a retry
                    throw new JSONError("Response data is null or undefined");
                }

                return Promise.resolve(
                    createSafeSuccessResult<Data>(
                        data as Data,
                    ),
                );
            } catch (error_: unknown) {
                if (attempt === retries) {
                    return Promise.resolve(
                        createSafeErrorResult(
                            new JSONError(
                                error_,
                                "Failed to parse JSON response after maximum retries",
                            ),
                        ),
                    );
                }

                throw new JSONError(error_);
            }
        } catch (error: unknown) {
            if (attempt === retries) {
                return Promise.resolve(
                    createSafeErrorResult(
                        new NetworkError(error, "Max retries reached"),
                    ),
                );
            }

            // Exponential backoff with jitter
            const backOff = Math.pow(backOffFactor, attempt) * delayMs;
            const jitter = backOff * 0.2 * (Math.random() - 0.5);
            const delay = backOff + jitter;

            console.log(
                `Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`,
            );

            return new Promise((resolve) => {
                setTimeout(() => {
                    tryAgain(attempt + 1).then(resolve);
                }, delay);
            });
        }
    }

    return tryAgain(0);
}

export {
    createSafeErrorResult,
    createSafeSuccessResult,
    getCachedItemAbortableSafe,
    parseDispatchAndSetState,
    parseSyncSafe,
    removeCachedItemAbortableSafe,
    retryFetchSafe,
    setCachedItemAbortableSafe,
};
