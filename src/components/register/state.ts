import { type Err, None, type Option } from "ts-results";
import type { AppError, ResponseData } from "../../types";

type RegisterState = {
    // handles caching operations
    cacheWorkerMaybe: Option<Worker>;
    // handles fetch operations
    fetchWorkerMaybe: Option<Worker>;
    // handles all storage operations
    forageWorkerMaybe: Option<Worker>;
    isLoading: boolean;
    // input names that allow focus management after seamless errorHOC recovery
    lastActiveInput: "username" | "password";
    password: string;
    responseDataMaybe: Option<Array<ResponseData>>;
    safeErrorMaybe: Option<Err<AppError>>;
    username: string;
};

const initialRegisterState: RegisterState = {
    cacheWorkerMaybe: None,
    fetchWorkerMaybe: None,
    forageWorkerMaybe: None,
    isLoading: false,
    lastActiveInput: "username",
    password: "",
    responseDataMaybe: None,
    safeErrorMaybe: None,
    username: "",
};

export { initialRegisterState };
export type { RegisterState };
