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
    NotFoundError,
    ParseError,
    PromiseAbortedError,
    UnknownError,
    WorkerMessageError,
} from "./errors";
import type { AppResult } from "./types";

function createSafeSuccessResult<Data = unknown>(
    data: Data,
): Ok<Option<NonNullable<Data>>> {
    return new Ok(data == null ? None : Some(data));
}

function createAppErrorResult(
    appErrorBase: AppErrorBase,
): Err<AppErrorBase> {
    if (appErrorBase instanceof AppErrorBase) {
        return new Err(appErrorBase);
    }

    return new Err(
        new UnknownError(
            appErrorBase,
            "createAppErrorResult received non-AppErrorBase instance",
        ),
    );
}

function parseSyncSafe<Output = unknown>(
    { object, schema }: {
        object: Output;
        schema: z.ZodType;
    },
): AppResult<Output> {
    try {
        const { data, error, success } = Array.isArray(object)
            ? z.array(schema).safeParse(object)
            : schema.safeParse(object);

        return success
            ? createSafeSuccessResult(data as Output)
            : createAppErrorResult(
                new ParseError(
                    `Failed to parse object: ${error.message}`,
                ),
            );
    } catch (error_: unknown) {
        return createAppErrorResult(
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
): Promise<AppResult<Data>> {
    if (signal.aborted) {
        return createAppErrorResult(
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
        return createAppErrorResult(
            new CacheError(error, `Failed to get cached item for key: ${key}`),
        );
    }
}

async function setCachedItemAbortableSafe<Data = unknown>(
    key: string,
    value: Data,
    signal: AbortSignal,
): Promise<AppResult> {
    if (signal.aborted) {
        return createAppErrorResult(
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
        return createAppErrorResult(
            new CacheError(error, `Failed to set cached item for key: ${key}`),
        );
    }
}

async function removeCachedItemAbortableSafe(
    key: string,
    signal: AbortSignal,
): Promise<AppResult> {
    if (signal.aborted) {
        return createAppErrorResult(
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
        return createAppErrorResult(
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
): Promise<AppResult<Data>> {
    const {
        backOffFactor = 2,
        retries = 3,
        delayMs = 1000,
    } = retryOptions ?? {};

    async function tryAgain(
        attempt: number,
    ): Promise<AppResult<Data>> {
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
                        createAppErrorResult(
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
                    createAppErrorResult(
                        new NetworkError(error, 503, "Max retries reached"),
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

function sendMessageToWorker<
    MsgEvent extends MessageEvent = MessageEvent,
    Actions extends Record<string, string> & {
        setSafeErrorMaybe: "setSafeErrorMaybe";
    } =
        & Record<string, string>
        & { setSafeErrorMaybe: "setSafeErrorMaybe" },
>(
    { actions, dispatch, message, workerMaybe }: {
        actions: Actions;
        dispatch: React.ActionDispatch<[dispatch: any]>;
        message: MsgEvent["data"];
        workerMaybe: Option<Worker>;
    },
): None {
    try {
        if (workerMaybe.none) {
            dispatch({
                action: actions.setSafeErrorMaybe,
                payload: Some(
                    createAppErrorResult(
                        new NotFoundError(
                            `Worker is not initialized for message: ${
                                String(message)
                            }`,
                        ),
                    ),
                ),
            });

            return None;
        }

        const worker = workerMaybe.val;
        worker.postMessage(message);
        return None;
    } catch (error) {
        dispatch({
            action: actions.setSafeErrorMaybe,
            payload: Some(
                createAppErrorResult(
                    new WorkerMessageError(
                        error,
                        `Failed to post message: ${String(message)} to worker`,
                    ),
                ),
            ),
        });
        return None;
    }
}

function capitalizeString(str: string): string {
    const parsedResult = parseSyncSafe({
        object: str,
        schema: z.string().min(1),
    });

    if (parsedResult.err) {
        return str;
    }
    const parsedMaybe = parsedResult.safeUnwrap();
    if (parsedMaybe.none) {
        return str;
    }
    const parsedStr = parsedMaybe.safeUnwrap();

    return `${parsedStr.charAt(0).toUpperCase()}${parsedStr.slice(1)}`;
}

export {
    capitalizeString,
    createAppErrorResult,
    createSafeSuccessResult,
    getCachedItemAbortableSafe,
    parseDispatchAndSetState,
    parseSyncSafe,
    removeCachedItemAbortableSafe,
    retryFetchSafe,
    sendMessageToWorker,
    setCachedItemAbortableSafe,
};
