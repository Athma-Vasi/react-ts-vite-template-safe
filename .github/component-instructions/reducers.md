# Reducers Generation Guide

Generate reducer functions using Map-based dispatch with individual handlers for
each action in `reducers.ts` within the component directory.

## Pattern

**Naming**: `{componentName}Reducer`, `{componentName}ReducersMap`,
`{componentName}Reducer_{actionName}`\
**Location**: `src/components/{component}/reducers.ts`\
**Export**: Named exports for main reducer, map, and individual reducers\
**Order**: Map entries and reducer functions alphabetically sorted\
**Utility**: Uses `parseDispatchAndSetState` for validated state updates

```typescript
import type { LoginState } from "./state";
import type { LoginDispatch } from "./dispatches";
import { loginActions } from "./actions";
import {
    setForageWorkerMaybeLoginDispatchSchema,
    setIsLoadingLoginDispatchSchema,
    setResponseDataLoginDispatchSchema,
    setSafeErrorMaybeLoginDispatchSchema,
    setUsernameLoginDispatchSchema,
} from "./dispatches";
import { parseDispatchAndSetState } from "../../utils";

function loginReducer(
    state: LoginState,
    dispatch: LoginDispatch,
): LoginState {
    const reducer = loginReducersMap.get(dispatch.action);
    return reducer == null ? state : reducer(state, dispatch);
}

const loginReducersMap: Map<
    LoginActions[keyof LoginActions],
    (state: LoginState, dispatch: LoginDispatch) => LoginState
> = new Map([
    [loginActions.setForageWorkerMaybe, loginReducer_setForageWorkerMaybe],
    [loginActions.setIsLoading, loginReducer_setIsLoading],
    [loginActions.setResponseData, loginReducer_setResponseData],
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

function loginReducer_setResponseData(
    state: LoginState,
    dispatch: LoginDispatch,
): LoginState {
    return parseDispatchAndSetState({
        dispatch,
        key: "responseData",
        state,
        schema: setResponseDataLoginDispatchSchema,
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
    loginReducer_setForageWorkerMaybe,
    loginReducer_setIsLoading,
    loginReducer_setResponseData,
    loginReducer_setSafeErrorMaybe,
    loginReducer_setUsername,
    loginReducersMap,
};
```

## parseDispatchAndSetState Utility

Validates dispatch via Zod schema, extracts payload, and immutably updates
state.

**Parameters:**

```typescript
{
    dispatch: Dispatch,    // Dispatch action object
    key: keyof State,      // State field name (MUST match exactly)
    state: State,          // Current state
    schema: ZodSchema,     // Zod validation schema
}
```

**Critical:** The `key` must exactly match the state field name:

```typescript
// State
type LoginState = {
    forageWorkerMaybe: Option<Worker>; // ← Field name
};

// Reducer - key MUST match
return parseDispatchAndSetState({
    key: "forageWorkerMaybe", // ← Exact match required
    // ...
});
```

## Rules

1. ✅ Use naming: `componentReducer`, `componentReducersMap`,
   `componentReducer_actionName`
2. ✅ Alphabetize Map entries and reducer functions by action name
3. ✅ Ensure `key` parameter exactly matches state field name
4. ✅ Import corresponding dispatch schema for each reducer
5. ✅ Export main reducer, individual reducers, and map
6. ✅ Use `parseDispatchAndSetState` for immutable updates
7. ❌ Never mutate state directly
8. ❌ Never skip alphabetical sorting
9. ❌ Never mismatch `key` with state field name

## Adding Fields

Insert new import, Map entry, and reducer function alphabetically:

```typescript
// Before
const loginReducersMap = new Map([
    [loginActions.setIsLoading, loginReducer_setIsLoading],
    [loginActions.setUsername, loginReducer_setUsername],
]);

function loginReducer_setIsLoading(...) { /* ... */ }
function loginReducer_setUsername(...) { /* ... */ }

// After adding password: string
import { setPasswordLoginDispatchSchema } from "./dispatches"; // ← Import

const loginReducersMap = new Map([
    [loginActions.setIsLoading, loginReducer_setIsLoading],
    [loginActions.setPassword, loginReducer_setPassword], // ← Map entry
    [loginActions.setUsername, loginReducer_setUsername],
]);

function loginReducer_setIsLoading(...) { /* ... */ }

function loginReducer_setPassword( // ← New reducer
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

function loginReducer_setUsername(...) { /* ... */ }

export {
    loginReducer,
    loginReducer_setIsLoading,
    loginReducer_setPassword, // ← Export
    loginReducer_setUsername,
    loginReducersMap,
};
```

## Advanced Patterns

**Custom logic before state update:**

```typescript
function loginReducer_setUsername(
    state: LoginState,
    dispatch: LoginDispatch,
): LoginState {
    // Custom validation or logging
    console.log("Setting username:", dispatch.payload);

    // Validate payload manually if needed
    if (dispatch.payload.length > 50) {
        console.warn("Username too long");
        return state; // Return unchanged state
    }

    // Then use utility for validated state update
    return parseDispatchAndSetState({
        dispatch,
        key: "username",
        state,
        schema: setUsernameLoginDispatchSchema,
    });
}
```
