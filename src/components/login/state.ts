import { type Err, None, type Option } from "ts-results";
import type { SafeError } from "../../types";

type LoginState = {
    isLoading: boolean;
    password: string;
    username: string;
    safeErrorMaybe: Option<Err<SafeError>>;
};

const initialLoginState: LoginState = {
    isLoading: false,
    password: "",
    username: "",
    safeErrorMaybe: None,
};

export { initialLoginState };
export type { LoginState };
