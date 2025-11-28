import { useReducer } from "react";
import ErrorSuspenseHOC from "../error";
import type { ErrorDispatch } from "../error/dispatches";
import { loginReducer } from "./reducers";
import { initialLoginState, type LoginState } from "./state";

type LoginProps = {
    // this component's state
    childComponentState: Record<string, unknown>;
    errorDispatch: React.Dispatch<ErrorDispatch>;
    initialChildState: LoginState;
};
function Login(
    { initialChildState, childComponentState, errorDispatch }: LoginProps,
) {
    const [
        loginState,
        loginDispatch,
    ] = useReducer(loginReducer, initialChildState);
    const {
        asyncWorkerMaybe,
        cacheWorkerMaybe,
        fetchWorkerMaybe,
        isLoading,
        password,
        safeErrorMaybe,
        username,
    } = loginState;

    if (safeErrorMaybe.some) {
        throw safeErrorMaybe.safeUnwrap();
    }

    return <div>Login Component</div>;
}

function LoginWrapper() {
    return ErrorSuspenseHOC(Login)(initialLoginState);
}

export default LoginWrapper;
