import { type Err, None, type Option } from "ts-results";
import type { SafeError } from "../../types";

type LoginState = {
    cacheWorkerMaybe: Option<Worker>;
    fetchWorkerMaybe: Option<Worker>;
    isLoading: boolean;
    password: string;
    safeErrorMaybe: Option<Err<SafeError>>;
    username: string;
};

const initialLoginState: LoginState = {
    cacheWorkerMaybe: None,
    fetchWorkerMaybe: None,
    isLoading: false,
    password: "",
    safeErrorMaybe: None,
    username: "",
};

export { initialLoginState };
export type { LoginState };
