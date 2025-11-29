import { parseDispatchAndSetState } from "../../utils";
import type { ErrorActions } from "./actions";
import { errorActions } from "./actions";
import type { ErrorDispatch } from "./dispatches";
import { setChildComponentStateErrorDispatchSchema } from "./dispatches";
import type { ErrorState } from "./state";

function errorReducer(
    state: ErrorState,
    dispatch: ErrorDispatch,
): ErrorState {
    const reducer = errorReducersMap.get(dispatch.action);
    return reducer ? reducer(state, dispatch) : state;
}

const errorReducersMap: Map<
    ErrorActions[keyof ErrorActions],
    (state: ErrorState, dispatch: ErrorDispatch) => ErrorState
> = new Map([
    [errorActions.setChildComponentState, errorReducer_setChildComponentState],
]);

function errorReducer_setChildComponentState(
    state: ErrorState,
    dispatch: ErrorDispatch,
): ErrorState {
    return parseDispatchAndSetState({
        dispatch,
        key: "childComponentState",
        state,
        schema: setChildComponentStateErrorDispatchSchema,
    });
}

export { errorReducer, errorReducer_setChildComponentState, errorReducersMap };
