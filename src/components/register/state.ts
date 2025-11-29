import { type Err, None, type Option } from "ts-results";
import type { SafeError } from "../../types";

type RegisterState = {
    // handles all storage operations
    forageWorkerMaybe: Option<Worker>;
    // handles caching operations
    cacheWorkerMaybe: Option<Worker>;
    // handles fetch operations
    fetchWorkerMaybe: Option<Worker>;
    isLoading: boolean;
    password: string;
    safeErrorMaybe: Option<Err<SafeError>>;
    username: string;
};

const initialRegisterState: RegisterState = {
    forageWorkerMaybe: None,
    cacheWorkerMaybe: None,
    fetchWorkerMaybe: None,
    isLoading: false,
    password: "",
    safeErrorMaybe: None,
    username: "",
};

export { initialRegisterState };
export type { RegisterState };
