import { parseDispatchAndSetState, parseSyncSafe } from "../../utils";
import type { ErrorActions } from "./actions";
import { errorActions } from "./actions";
import type { ErrorDispatch } from "./dispatches";
import {
    setChildComponentStateErrorDispatchSchema,
    setLoggerWorkerMaybeErrorDispatchSchema,
} from "./dispatches";
import type { ErrorState } from "./state";

function errorReducer(
    state: ErrorState,
    dispatch: ErrorDispatch,
): ErrorState {
    const reducer = errorReducersMap.get(dispatch.action);
    return reducer == null ? state : reducer(state, dispatch);
}

const errorReducersMap: Map<
    ErrorActions[keyof ErrorActions],
    (state: ErrorState, dispatch: ErrorDispatch) => ErrorState
> = new Map([
    [errorActions.setChildComponentState, errorReducer_setChildComponentState],
    [errorActions.setLoggerWorkerMaybe, errorReducer_setLoggerWorkerMaybe],
]);

function errorReducer_setChildComponentState(
    state: ErrorState,
    dispatch: ErrorDispatch,
): ErrorState {
    const parsedResult = parseSyncSafe({
        object: dispatch,
        schema: setChildComponentStateErrorDispatchSchema,
    });
    if (parsedResult.err) {
        return state;
    }
    const parsedMaybe = parsedResult.safeUnwrap();
    if (parsedMaybe.none) {
        return state;
    }
    const { payload } = parsedMaybe.safeUnwrap();

    return {
        ...state,
        childComponentState: {
            ...state.childComponentState,
            ...payload,
        },
    };
}

function errorReducer_setLoggerWorkerMaybe(
    state: ErrorState,
    dispatch: ErrorDispatch,
): ErrorState {
    return parseDispatchAndSetState({
        state,
        dispatch,
        key: "loggerWorkerMaybe",
        schema: setLoggerWorkerMaybeErrorDispatchSchema,
    });
}

export {
    errorReducer,
    errorReducer_setChildComponentState,
    errorReducer_setLoggerWorkerMaybe,
    errorReducersMap,
};
