import { parseDispatchAndSetState } from "../../utils";
import type { ErrorActions } from "./actions.ts";
import { errorActions } from "./actions.ts";
import type { ErrorDispatch } from "./dispatches.ts";
import { setChildComponentStateErrorDispatchSchema } from "./dispatches.ts";

import type { ErrorState } from "./state.ts";

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
