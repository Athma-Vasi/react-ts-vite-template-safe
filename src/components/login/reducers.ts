import { parseDispatchAndSetState } from "../../utils";
import type { LoginActions } from "./actions";
import { loginActions } from "./actions";
import type { LoginDispatch } from "./dispatches";
import {
    setCacheWorkerLoginDispatchSchema,
    setIsLoadingLoginDispatchSchema,
    setPasswordLoginDispatchSchema,
    setUsernameLoginDispatchSchema,
} from "./dispatches";
import type { LoginState } from "./state";

function loginReducer(
    state: LoginState,
    dispatch: LoginDispatch,
): LoginState {
    const reducer = loginReducersMap.get(dispatch.action);
    return reducer ? reducer(state, dispatch) : state;
}

const loginReducersMap: Map<
    LoginActions[keyof LoginActions],
    (state: LoginState, dispatch: LoginDispatch) => LoginState
> = new Map([
    [loginActions.setCacheWorker, loginReducer_setCacheWorker],
    [loginActions.setIsLoading, loginReducer_setIsLoading],
    [loginActions.setPassword, loginReducer_setPassword],
    [loginActions.setSafeErrorMaybe, loginReducer_setSafeErrorMaybe],
    [loginActions.setUsername, loginReducer_setUsername],
]);

function loginReducer_setCacheWorker(
    state: LoginState,
    dispatch: LoginDispatch,
): LoginState {
    return parseDispatchAndSetState({
        dispatch,
        key: "cacheWorker",
        state,
        zSchema: setCacheWorkerLoginDispatchSchema,
    });
}

function loginReducer_setIsLoading(
    state: LoginState,
    dispatch: LoginDispatch,
): LoginState {
    return parseDispatchAndSetState({
        dispatch,
        key: "isLoading",
        state,
        zSchema: setIsLoadingLoginDispatchSchema,
    });
}

function loginReducer_setPassword(
    state: LoginState,
    dispatch: LoginDispatch,
): LoginState {
    return parseDispatchAndSetState({
        dispatch,
        key: "password",
        state,
        zSchema: setPasswordLoginDispatchSchema,
    });
}

function loginReducer_setSafeErrorMaybe(
    state: LoginState,
    dispatch: LoginDispatch,
): LoginState {
    return parseDispatchAndSetState({
        dispatch,
        key: "safeErrorMaybe",
        state,
        zSchema: setIsLoadingLoginDispatchSchema,
    });
}

function loginReducer_setUsername(
    state: LoginState,
    dispatch: LoginDispatch,
): LoginState {
    return parseDispatchAndSetState({
        dispatch,
        key: "username",
        state,
        zSchema: setUsernameLoginDispatchSchema,
    });
}

export {
    loginReducer,
    loginReducer_setIsLoading,
    loginReducer_setPassword,
    loginReducer_setUsername,
    loginReducersMap,
};
