import type { LoginState } from "./state";

type LoginActions = {
    [K in keyof LoginState as `set${Capitalize<string & K>}`]: `set${Capitalize<
        string & K
    >}`;
};

const loginActions: LoginActions = {
    setForageWorkerMaybe: "setForageWorkerMaybe",
    setCacheWorkerMaybe: "setCacheWorkerMaybe",
    setFetchWorkerMaybe: "setFetchWorkerMaybe",
    setIsLoading: "setIsLoading",
    setPassword: "setPassword",
    setSafeErrorMaybe: "setSafeErrorMaybe",
    setUsername: "setUsername",
};

export { loginActions };
export type { LoginActions };
