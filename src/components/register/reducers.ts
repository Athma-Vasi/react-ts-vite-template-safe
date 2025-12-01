import { parseDispatchAndSetState } from "../../utils";
import { type RegisterActions, registerActions } from "./actions";
import type { RegisterDispatch } from "./dispatches";
import {
    setCacheWorkerMaybeRegisterDispatchSchema,
    setFetchWorkerMaybeRegisterDispatchSchema,
    setForageWorkerMaybeRegisterDispatchSchema,
    setIsLoadingRegisterDispatchSchema,
    setPasswordRegisterDispatchSchema,
    setResponseDataMaybeRegisterDispatchSchema,
    setSafeErrorMaybeRegisterDispatchSchema,
    setUsernameRegisterDispatchSchema,
} from "./dispatches";
import type { RegisterState } from "./state";

function registerReducer(
    state: RegisterState,
    dispatch: RegisterDispatch,
): RegisterState {
    const reducer = registerReducersMap.get(dispatch.action);
    return reducer == null ? state : reducer(state, dispatch);
}

const registerReducersMap: Map<
    RegisterActions[keyof RegisterActions],
    (state: RegisterState, dispatch: RegisterDispatch) => RegisterState
> = new Map([
    [
        registerActions.setForageWorkerMaybe,
        registerReducer_setForageWorkerMaybe,
    ],
    [registerActions.setCacheWorkerMaybe, registerReducer_setCacheWorkerMaybe],
    [registerActions.setFetchWorkerMaybe, registerReducer_setFetchWorkerMaybe],
    [registerActions.setIsLoading, registerReducer_setIsLoading],
    [registerActions.setPassword, registerReducer_setPassword],
    [
        registerActions.setResponseDataMaybe,
        registerReducer_setResponseDataMaybe,
    ],
    [registerActions.setSafeErrorMaybe, registerReducer_setSafeErrorMaybe],
    [registerActions.setUsername, registerReducer_setUsername],
]);

function registerReducer_setForageWorkerMaybe(
    state: RegisterState,
    dispatch: RegisterDispatch,
): RegisterState {
    return parseDispatchAndSetState({
        dispatch,
        key: "forageWorkerMaybe",
        state,
        schema: setForageWorkerMaybeRegisterDispatchSchema,
    });
}

function registerReducer_setCacheWorkerMaybe(
    state: RegisterState,
    dispatch: RegisterDispatch,
): RegisterState {
    return parseDispatchAndSetState({
        dispatch,
        key: "cacheWorkerMaybe",
        state,
        schema: setCacheWorkerMaybeRegisterDispatchSchema,
    });
}

function registerReducer_setFetchWorkerMaybe(
    state: RegisterState,
    dispatch: RegisterDispatch,
): RegisterState {
    return parseDispatchAndSetState({
        dispatch,
        key: "fetchWorkerMaybe",
        state,
        schema: setFetchWorkerMaybeRegisterDispatchSchema,
    });
}

function registerReducer_setIsLoading(
    state: RegisterState,
    dispatch: RegisterDispatch,
): RegisterState {
    return parseDispatchAndSetState({
        dispatch,
        key: "isLoading",
        state,
        schema: setIsLoadingRegisterDispatchSchema,
    });
}

function registerReducer_setPassword(
    state: RegisterState,
    dispatch: RegisterDispatch,
): RegisterState {
    return parseDispatchAndSetState({
        dispatch,
        key: "password",
        state,
        schema: setPasswordRegisterDispatchSchema,
    });
}

function registerReducer_setResponseDataMaybe(
    state: RegisterState,
    dispatch: RegisterDispatch,
): RegisterState {
    return parseDispatchAndSetState({
        dispatch,
        key: "responseDataMaybe",
        state,
        schema: setResponseDataMaybeRegisterDispatchSchema,
    });
}

function registerReducer_setSafeErrorMaybe(
    state: RegisterState,
    dispatch: RegisterDispatch,
): RegisterState {
    return parseDispatchAndSetState({
        dispatch,
        key: "safeErrorMaybe",
        state,
        schema: setSafeErrorMaybeRegisterDispatchSchema,
    });
}

function registerReducer_setUsername(
    state: RegisterState,
    dispatch: RegisterDispatch,
): RegisterState {
    return parseDispatchAndSetState({
        dispatch,
        key: "username",
        state,
        schema: setUsernameRegisterDispatchSchema,
    });
}

export {
    registerReducer,
    registerReducer_setCacheWorkerMaybe,
    registerReducer_setFetchWorkerMaybe,
    registerReducer_setForageWorkerMaybe,
    registerReducer_setIsLoading,
    registerReducer_setPassword,
    registerReducer_setResponseDataMaybe,
    registerReducer_setSafeErrorMaybe,
    registerReducer_setUsername,
    registerReducersMap,
};
