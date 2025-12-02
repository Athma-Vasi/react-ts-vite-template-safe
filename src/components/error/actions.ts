import type { ErrorState } from "./state";

type ErrorActions = {
    [K in keyof ErrorState as `set${Capitalize<string & K>}`]: `set${Capitalize<
        string & K
    >}`;
};

const errorActions: ErrorActions = {
    setChildComponentState: "setChildComponentState",
    setLoggerWorkerMaybe: "setLoggerWorkerMaybe",
};

export { errorActions };
export type { ErrorActions };
