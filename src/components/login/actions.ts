import type { LoginState } from "./state";

type LoginActions = {
    [K in keyof LoginState as `set${Capitalize<string & K>}`]: `set${Capitalize<
        string & K
    >}`;
};

const loginActions: LoginActions = {
    setIsLoading: "setIsLoading",
    setPassword: "setPassword",
    setUsername: "setUsername",
    setSafeErrorMaybe: "setSafeErrorMaybe",
};

export { loginActions };
export type { LoginActions };
