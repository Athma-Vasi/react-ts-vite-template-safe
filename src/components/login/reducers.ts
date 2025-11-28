import { parseDispatchAndSetState } from "../../utils";
import type { LoginActions } from "./actions";
import { loginActions } from "./actions";
import type { LoginDispatch } from "./dispatches";
import {
    setCacheWorkerMaybeLoginDispatchSchema,
    setFetchWorkerMaybeLoginDispatchSchema,
    setForageWorkerMaybeLoginDispatchSchema,
    setIsLoadingLoginDispatchSchema,
    setPasswordLoginDispatchSchema,
    setSafeErrorMaybeLoginDispatchSchema,
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
    [loginActions.setForageWorkerMaybe, loginReducer_setForageWorkerMaybe],
    [loginActions.setCacheWorkerMaybe, loginReducer_setCacheWorkerMaybe],
    [loginActions.setFetchWorkerMaybe, loginReducer_setFetchWorkerMaybe],
    [loginActions.setIsLoading, loginReducer_setIsLoading],
    [loginActions.setPassword, loginReducer_setPassword],
    [loginActions.setSafeErrorMaybe, loginReducer_setSafeErrorMaybe],
    [loginActions.setUsername, loginReducer_setUsername],
]);

function loginReducer_setForageWorkerMaybe(
    state: LoginState,
    dispatch: LoginDispatch,
): LoginState {
    return parseDispatchAndSetState({
        dispatch,
        key: "forageWorkerMaybe",
        state,
        schema: setForageWorkerMaybeLoginDispatchSchema,
    });
}

function loginReducer_setCacheWorkerMaybe(
    state: LoginState,
    dispatch: LoginDispatch,
): LoginState {
    return parseDispatchAndSetState({
        dispatch,
        key: "cacheWorkerMaybe",
        state,
        schema: setCacheWorkerMaybeLoginDispatchSchema,
    });
}

function loginReducer_setFetchWorkerMaybe(
    state: LoginState,
    dispatch: LoginDispatch,
): LoginState {
    return parseDispatchAndSetState({
        dispatch,
        key: "fetchWorkerMaybe",
        state,
        schema: setFetchWorkerMaybeLoginDispatchSchema,
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
        schema: setIsLoadingLoginDispatchSchema,
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
        schema: setPasswordLoginDispatchSchema,
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
        schema: setSafeErrorMaybeLoginDispatchSchema,
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
        schema: setUsernameLoginDispatchSchema,
    });
}

export {
    loginReducer,
    loginReducer_setCacheWorkerMaybe,
    loginReducer_setFetchWorkerMaybe,
    loginReducer_setForageWorkerMaybe,
    loginReducer_setIsLoading,
    loginReducer_setPassword,
    loginReducer_setUsername,
    loginReducersMap,
};
