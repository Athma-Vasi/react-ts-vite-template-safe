import type { RegisterState } from "./state";

type RegisterActions = {
    [K in keyof RegisterState as `set${Capitalize<string & K>}`]:
        `set${Capitalize<
            string & K
        >}`;
};

const registerActions: RegisterActions = {
    setForageWorkerMaybe: "setForageWorkerMaybe",
    setCacheWorkerMaybe: "setCacheWorkerMaybe",
    setFetchWorkerMaybe: "setFetchWorkerMaybe",
    setIsLoading: "setIsLoading",
    setPassword: "setPassword",
    setSafeErrorMaybe: "setSafeErrorMaybe",
    setUsername: "setUsername",
};

export { registerActions };
export type { RegisterActions };
