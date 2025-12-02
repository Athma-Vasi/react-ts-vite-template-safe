import { None, type Option, Some } from "ts-results";

function getErrorKind(error: unknown): string {
    if (error instanceof Error) {
        return error.name;
    }
    if (error == null) {
        return "UnknownError";
    }
    return String(error);
}

function getErrorStack(error: unknown): string {
    if (error instanceof Error && error.stack) {
        return error.stack;
    }
    return "Stack trace not available";
}

abstract class AppErrorBase {
    abstract readonly _tag: string;
    public readonly name: string;
    public readonly message: string;
    public readonly errorKind: string;
    public readonly stack: string;
    public readonly status: Option<number>;
    public readonly timestamp: string;

    constructor(
        name: string,
        errorKind: string,
        stack: string,
        message: string,
        status: Option<number> = None,
        timestamp: string = new Date().toISOString(),
    ) {
        this.name = name;
        this.errorKind = errorKind;
        this.message = message;
        this.stack = stack;
        this.status = status;
        this.timestamp = timestamp;
    }
}

class AuthError extends AppErrorBase {
    readonly _tag = "AuthError";

    constructor(
        error?: unknown,
        message = "Authentication error occurred",
    ) {
        super(
            "AuthError",
            getErrorKind(error),
            getErrorStack(error),
            message,
        );
    }
}

class ValidationError extends AppErrorBase {
    readonly _tag = "ValidationError";

    constructor(error?: unknown, message = "Validation error occurred") {
        super(
            "ValidationError",
            getErrorKind(error),
            getErrorStack(error),
            message,
        );
    }
}

class DatabaseError extends AppErrorBase {
    readonly _tag = "DatabaseError";

    constructor(
        error?: unknown,
        status: number = 500,
        message = "Database error occurred",
    ) {
        super(
            "DatabaseError",
            getErrorKind(error),
            getErrorStack(error),
            message,
            Some(status),
        );
    }
}

class NotFoundError extends AppErrorBase {
    readonly _tag = "NotFoundError";

    constructor(error?: unknown, message = "Resource not found") {
        super(
            "NotFoundError",
            getErrorKind(error),
            getErrorStack(error),
            message,
        );
    }
}

class NetworkError extends AppErrorBase {
    readonly _tag = "NetworkError";

    constructor(
        error?: unknown,
        status: number = 503,
        message = "Network error occurred",
    ) {
        super(
            "NetworkError",
            getErrorKind(error),
            getErrorStack(error),
            message,
            Some(status),
        );
    }
}

class TokenCreationError extends AppErrorBase {
    readonly _tag = "TokenCreationError";

    constructor(error?: unknown, message = "Token creation error occurred") {
        super(
            "TokenCreationError",
            getErrorKind(error),
            getErrorStack(error),
            message,
        );
    }
}

class TokenDecodeError extends AppErrorBase {
    readonly _tag = "TokenDecodeError";

    constructor(error?: unknown, message = "Token decoding error occurred") {
        super(
            "TokenDecodeError",
            getErrorKind(error),
            getErrorStack(error),
            message,
        );
    }
}

class TokenVerificationError extends AppErrorBase {
    readonly _tag = "TokenVerificationError";

    constructor(
        error?: unknown,
        message = "Token verification error occurred",
    ) {
        super(
            "TokenVerificationError",
            getErrorKind(error),
            getErrorStack(error),
            message,
        );
    }
}

class TokenSignatureError extends AppErrorBase {
    readonly _tag = "TokenSignatureError";

    constructor(
        error?: unknown,
        message = "Token signature error occurred",
    ) {
        super(
            "TokenSignatureError",
            getErrorKind(error),
            getErrorStack(error),
            message,
        );
    }
}

class TimeoutError extends AppErrorBase {
    readonly _tag = "TimeoutError";

    constructor(error?: unknown, message = "Operation timed out") {
        super(
            "TimeoutError",
            getErrorKind(error),
            getErrorStack(error),
            message,
        );
    }
}

class PromiseRejectionError extends AppErrorBase {
    readonly _tag = "PromiseRejectionError";

    constructor(error?: unknown, message = "Unhandled promise rejection") {
        super(
            "PromiseRejectionError",
            getErrorKind(error),
            getErrorStack(error),
            message,
        );
    }
}

class PromiseAbortedError extends AppErrorBase {
    readonly _tag = "PromiseAbortedError";

    constructor(error?: unknown, message = "Promise was aborted") {
        super(
            "PromiseAbortedError",
            getErrorKind(error),
            getErrorStack(error),
            message,
        );
    }
}

class RetryLimitExceededError extends AppErrorBase {
    readonly _tag = "RetryLimitExceededError";

    constructor(error?: unknown, message = "Retry limit exceeded") {
        super(
            "RetryLimitExceededError",
            getErrorKind(error),
            getErrorStack(error),
            message,
        );
    }
}

class HashComparisonError extends AppErrorBase {
    readonly _tag = "HashComparisonError";

    constructor(error?: unknown, message = "Hash comparison error occurred") {
        super(
            "HashComparisonError",
            getErrorKind(error),
            getErrorStack(error),
            message,
        );
    }
}

class HashGenerationError extends AppErrorBase {
    readonly _tag = "HashGenerationError";

    constructor(error?: unknown, message = "Hash generation error occurred") {
        super(
            "HashGenerationError",
            getErrorKind(error),
            getErrorStack(error),
            message,
        );
    }
}

class AbortError extends AppErrorBase {
    readonly _tag = "AbortError";

    constructor(error?: unknown, message = "Operation was aborted") {
        super(
            "AbortError",
            getErrorKind(error),
            getErrorStack(error),
            message,
        );
    }
}

class CacheError extends AppErrorBase {
    readonly _tag = "CacheError";

    constructor(error?: unknown, message = "Cache error occurred") {
        super(
            "CacheError",
            getErrorKind(error),
            getErrorStack(error),
            message,
        );
    }
}

class JSONError extends AppErrorBase {
    readonly _tag = "JSONError";

    constructor(error?: unknown, message = "JSON error occurred") {
        super(
            "JSONError",
            getErrorKind(error),
            getErrorStack(error),
            message,
        );
    }
}

class ParseError extends AppErrorBase {
    readonly _tag = "ParseError";

    constructor(error?: unknown, message = "Parse error occurred") {
        super(
            "ParseError",
            getErrorKind(error),
            getErrorStack(error),
            message,
        );
    }
}

class InvariantError extends AppErrorBase {
    readonly _tag = "InvariantError";

    constructor(error?: unknown, message = "Invariant error occurred") {
        super(
            "InvariantError",
            getErrorKind(error),
            getErrorStack(error),
            message,
        );
    }
}

class HTTPError extends AppErrorBase {
    readonly _tag = "HTTPError";

    constructor(
        error?: unknown,
        message = "HTTP error occurred",
    ) {
        super(
            "HTTPError",
            getErrorKind(error),
            getErrorStack(error),
            message,
        );
    }
}

class UnknownError extends AppErrorBase {
    readonly _tag = "UnknownError";

    constructor(error?: unknown, message = "An unknown error occurred") {
        super(
            "UnknownError",
            getErrorKind(error),
            getErrorStack(error),
            message,
        );
    }
}

class WorkerError extends AppErrorBase {
    readonly _tag = "WorkerError";

    constructor(error?: unknown, message = "Worker error occurred") {
        super(
            "WorkerError",
            getErrorKind(error),
            getErrorStack(error),
            message,
        );
    }
}

class WorkerMessageError extends AppErrorBase {
    readonly _tag = "WorkerMessageError";

    constructor(error?: unknown, message = "Worker message error occurred") {
        super(
            "WorkerMessageError",
            getErrorKind(error),
            getErrorStack(error),
            message,
        );
    }
}

class WorkerMessageHandlerError extends AppErrorBase {
    readonly _tag = "WorkerMessageHandlerError";

    constructor(
        error?: unknown,
        message = "Worker message handler error occurred",
    ) {
        super(
            "WorkerMessageHandlerError",
            getErrorKind(error),
            getErrorStack(error),
            message,
        );
    }
}

export {
    AbortError,
    AppErrorBase,
    AuthError,
    CacheError,
    DatabaseError,
    HashComparisonError,
    HashGenerationError,
    HTTPError,
    InvariantError,
    JSONError,
    NetworkError,
    NotFoundError,
    ParseError,
    PromiseAbortedError,
    PromiseRejectionError,
    RetryLimitExceededError,
    TimeoutError,
    TokenCreationError,
    TokenDecodeError,
    TokenSignatureError,
    TokenVerificationError,
    UnknownError,
    ValidationError,
    WorkerError,
    WorkerMessageError,
    WorkerMessageHandlerError,
};
