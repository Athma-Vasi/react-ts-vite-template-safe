import type { Option, Result } from "ts-results";

type NonNullableObject<T> = {
    [K in keyof T as T[K] extends null | undefined ? never : K]: T[K] extends
        object ? NonNullableObject<T[K]>
        : T[K];
};

// gives the final flattened type after mapping, intersecting, or conditional logic
type Prettify<T> =
    & {
        [K in keyof T]: T[K];
    }
    & {};

type SafeSuccess<Data = unknown> = Option<Data>;
type SafeError = {
    name: string;
    errorKind: string;
    stack: string;
    message: string;
    status: Option<number>;
    timestamp: string;
};
type SafeResult<Data = unknown> = Result<
    SafeSuccess<Data>,
    SafeError
>;

type ValidationRegexes = Array<[RegExp, string]>;

type ResponseData = {
    body: string;
    id: number;
    title: string;
    userId: number;
};

export type {
    NonNullableObject,
    Prettify,
    ResponseData,
    SafeError,
    SafeResult,
    SafeSuccess,
    ValidationRegexes,
};
