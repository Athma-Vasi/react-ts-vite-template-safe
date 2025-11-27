import { type Err, None, type Option } from "ts-results";
import type { SafeError } from "../../types";

type LoginState = {
    // handles all async operations
    asyncWorkerMaybe: Option<Worker>;
    // handles caching operations
    cacheWorkerMaybe: Option<Worker>;
    // handles fetch operations
    fetchWorkerMaybe: Option<Worker>;
    isLoading: boolean;
    password: string;
    safeErrorMaybe: Option<Err<SafeError>>;
    username: string;
};

const initialLoginState: LoginState = {
    asyncWorkerMaybe: None,
    cacheWorkerMaybe: None,
    fetchWorkerMaybe: None,
    isLoading: false,
    password: "",
    safeErrorMaybe: None,
    username: "",
};

export { initialLoginState };
export type { LoginState };
