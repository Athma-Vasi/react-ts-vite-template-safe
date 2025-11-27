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
    ZodString,
} from "zod";
import type { $strip } from "zod/v4/core";
import { AppErrorBase, CacheError, ParseError } from "./errors";
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
    { object, zSchema }: {
        object: Output;
        zSchema: z.ZodSchema;
    },
): SafeResult<Output> {
    try {
        const { data, error, success } = Array.isArray(object)
            ? z.array(zSchema).safeParse(object)
            : zSchema.safeParse(object);

        return success
            ? createSafeSuccessResult(data as Output)
            : createSafeErrorResult(
                new ParseError(
                    `Failed to parse object: ${error.message}`,
                ),
            );
    } catch (error_: unknown) {
        return createSafeErrorResult(error_);
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
        | ZodObject = any,
    Dispatch extends { action: string; payload: unknown } = {
        action: string;
        payload: unknown;
    },
    State extends Record<PropertyKey, unknown> = Record<PropertyKey, unknown>,
>(
    { dispatch, key, state, zSchema }: {
        dispatch: Dispatch;
        zSchema: ZodObject<
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
            zSchema,
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

async function getCachedItemAsyncSafe<Data = unknown>(
    key: string,
): Promise<SafeResult<Data>> {
    try {
        const data = await localforage.getItem<Data>(key);
        return createSafeSuccessResult(data);
    } catch (error: unknown) {
        return createSafeErrorResult(
            new CacheError(error, `Failed to get cached item for key: ${key}`),
        );
    }
}

async function setCachedItemAsyncSafe<Data = unknown>(
    key: string,
    value: Data,
): Promise<SafeResult> {
    try {
        await localforage.setItem(key, value);
        return new Ok(None);
    } catch (error: unknown) {
        return createSafeErrorResult(
            new CacheError(error, `Failed to set cached item for key: ${key}`),
        );
    }
}

async function removeCachedItemAsyncSafe(
    key: string,
): Promise<SafeResult> {
    try {
        await localforage.removeItem(key);
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

export {
    createSafeErrorResult,
    createSafeSuccessResult,
    getCachedItemAsyncSafe,
    parseDispatchAndSetState,
    parseSyncSafe,
    removeCachedItemAsyncSafe,
    setCachedItemAsyncSafe,
};
