import { type Err, None, type Option } from "ts-results";
import type { SafeError } from "../../types";

type LoginState = {
    cacheWorker: Option<Worker>;
    isLoading: boolean;
    password: string;
    safeErrorMaybe: Option<Err<SafeError>>;
    username: string;
};

const initialLoginState: LoginState = {
    cacheWorker: None,
    isLoading: false,
    password: "",
    safeErrorMaybe: None,
    username: "",
};

export { initialLoginState };
export type { LoginState };
