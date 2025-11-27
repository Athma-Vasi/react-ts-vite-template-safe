# Reducers Generation Guide 🎯

## 📋 Purpose

Generate reducer functions that handle state updates based on dispatched
actions. The reducer pattern uses a Map-based approach with individual reducer
functions for each action, validated through Zod schemas via the
`parseDispatchAndSetState` utility.

## 📍 File Location

- **Create** `reducers.ts` in the component's directory
- **Example**: `src/components/login/reducers.ts`
- **Convention**: Name pattern should be `{componentName}Reducer`,
  `{componentName}ReducersMap`, and `{componentName}Reducer_{actionName}`

## 🎯 Basic Pattern

Given a state type **LoginState** with fields:

```typescript
type LoginState = {
    forageWorker: Worker | null;
    isLoading: boolean;
    username: string;
};
```

Generate the following in `reducers.ts`:

```typescript
import type { LoginState } from "./state";
import type { LoginDispatch } from "./dispatches";
import { loginAction } from "./actions";
import {
    setForageWorkerLoginDispatchSchema,
    setIsLoadingLoginDispatchSchema,
    setUsernameLoginDispatchSchema,
} from "./dispatches";
import { parseDispatchAndSetState } from "../../utils";

function loginReducer(
    state: LoginState,
    dispatch: LoginDispatch,
): LoginState {
    const reducer = loginReducersMap.get(dispatch.action);
    return reducer ? reducer(state, dispatch) : state;
}

const loginReducersMap: Map<
    LoginAction[keyof LoginAction],
    (state: LoginState, dispatch: LoginDispatch) => LoginState
> = new Map([
    [loginAction.setForageWorker, loginReducer_setForageWorker],
    [loginAction.setIsLoading, loginReducer_setIsLoading],
    [loginAction.setUsername, loginReducer_setUsername],
]);

function loginReducer_setForageWorker(
    state: LoginState,
    dispatch: LoginDispatch,
): LoginState {
    return parseDispatchAndSetState({
        dispatch,
        key: "forageWorker",
        state,
        zSchema: setForageWorkerLoginDispatchSchema,
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
    loginReducer_setForageWorker,
    loginReducer_setIsLoading,
    loginReducer_setUsername,
    loginReducersMap,
};
```

**Key Points**:

- Main reducer function delegates to specific reducers via Map lookup
- Map entries are sorted **alphabetically** by action name
- Specific reducer functions are sorted **alphabetically**
- Each specific reducer uses `parseDispatchAndSetState` utility
- The `key` parameter must **exactly match** the state field name
- Export the main reducer, individual reducers, and the map

## ➕ Adding to Existing Reducers

If `reducers.ts` already exists with:

```typescript
import type { LoginState } from "./state";
import type { LoginDispatch } from "./dispatches";
import { loginAction } from "./actions";
import {
    setIsLoadingLoginDispatchSchema,
    setUsernameLoginDispatchSchema,
} from "./dispatches";
import { parseDispatchAndSetState } from "../../utils";

function loginReducer(
    state: LoginState,
    dispatch: LoginDispatch,
): LoginState {
    const reducer = loginReducersMap.get(dispatch.action);
    return reducer ? reducer(state, dispatch) : state;
}

const loginReducersMap: Map<
    LoginAction[keyof LoginAction],
    (state: LoginState, dispatch: LoginDispatch) => LoginState
> = new Map([
    [loginAction.setIsLoading, loginReducer_setIsLoading],
    [loginAction.setUsername, loginReducer_setUsername],
]);

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
    loginReducer_setUsername,
    loginReducersMap,
};
```

And you need to add a new field `password: string`:

**Add import, Map entry, and specific reducer function** maintaining
alphabetical order:

```typescript
import type { LoginState } from "./state";
import type { LoginDispatch } from "./dispatches";
import { loginAction } from "./actions";
import {
    setIsLoadingLoginDispatchSchema,
    setPasswordLoginDispatchSchema, // ← New import
    setUsernameLoginDispatchSchema,
} from "./dispatches";
import { parseDispatchAndSetState } from "../../utils";

function loginReducer(
    state: LoginState,
    dispatch: LoginDispatch,
): LoginState {
    const reducer = loginReducersMap.get(dispatch.action);
    return reducer ? reducer(state, dispatch) : state;
}

const loginReducersMap: Map<
    LoginAction[keyof LoginAction],
    (state: LoginState, dispatch: LoginDispatch) => LoginState
> = new Map([
    [loginAction.setIsLoading, loginReducer_setIsLoading],
    [loginAction.setPassword, loginReducer_setPassword], // ← New Map entry
    [loginAction.setUsername, loginReducer_setUsername],
]);

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

function loginReducer_setPassword( // ← New reducer function
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
    loginReducer_setPassword, // ← Export new reducer
    loginReducer_setUsername,
    loginReducersMap,
};
```

## 🔧 parseDispatchAndSetState Utility

The `parseDispatchAndSetState` utility is a helper function that:

1. **Validates** the dispatch against the Zod schema
2. **Extracts** the payload
3. **Updates** the state immutably
4. **Returns** the new state

### Parameters

```typescript
{
    dispatch: Dispatch,      // The dispatch action object
    key: keyof State,        // The state field to update (must match exactly!)
    state: State,            // The current state
    zSchema: ZodSchema,      // The Zod schema for validation
}
```

### Critical: The `key` Parameter

⚠️ **The `key` must exactly match the state field name!**

```typescript
// State definition
type LoginState = {
    forageWorker: Worker | null; // ← Field name
};

// Reducer - key MUST match
function loginReducer_setForageWorker(
    state: LoginState,
    dispatch: LoginDispatch,
): LoginState {
    return parseDispatchAndSetState({
        dispatch,
        key: "forageWorker", // ← Must be exactly "forageWorker"
        state,
        zSchema: setForageWorkerLoginDispatchSchema,
    });
}
```

## ✨ Best Practices

1. **Naming Convention**:
   - Main reducer: `{componentName}Reducer`
   - Map: `{componentName}ReducersMap`
   - Specific reducers: `{componentName}Reducer_{actionName}`
   - ✅ `loginReducer`, `loginReducersMap`, `loginReducer_setUsername`
   - ❌ `reducer`, `reducerMap`, `setUsername`

2. **Alphabetical Order**:
   - Imports sorted alphabetically
   - Map entries sorted by action name
   - Specific reducer functions sorted by action name

3. **Key Matching**: Ensure the `key` parameter **exactly matches** the state
   field name

4. **Schema Import**: Import the corresponding dispatch schema for each reducer

5. **Type Safety**: Use proper types for state and dispatch parameters

6. **Immutability**: The utility handles immutability - never mutate state
   directly

7. **Export Pattern**: Export the main reducer, individual reducers, and map

## ⚠️ Common Mistakes

1. **Key Mismatch**: Using wrong key name
   ```typescript
   // State field: forageWorker
   // ❌ Wrong
   return parseDispatchAndSetState({
       key: "worker", // Wrong! Doesn't match state field
       // ...
   });

   // ✅ Correct
   return parseDispatchAndSetState({
       key: "forageWorker", // Matches state field exactly
       // ...
   });
   ```

2. **Wrong Schema**: Using incorrect dispatch schema
   ```typescript
   // ❌ Wrong
   function loginReducer_setUsername(...) {
       return parseDispatchAndSetState({
           key: "username",
           zSchema: setPasswordLoginDispatchSchema,  // Wrong schema!
       });
   }

   // ✅ Correct
   function loginReducer_setUsername(...) {
       return parseDispatchAndSetState({
           key: "username",
           zSchema: setUsernameLoginDispatchSchema,  // Correct schema
       });
   }
   ```

3. **Missing Map Entry**: Forgetting to add action to the Map
   ```typescript
   // ❌ Wrong - function exists but not in Map
   const reducersMap = new Map([
       [action.setUsername, reducer_setUsername],
       // Missing setPassword!
   ]);

   function reducer_setPassword(...) { /* ... */ }

   // ✅ Correct - all functions in Map
   const reducersMap = new Map([
       [action.setPassword, reducer_setPassword],
       [action.setUsername, reducer_setUsername],
   ]);
   ```

4. **Direct State Mutation**: Trying to mutate state directly
   ```typescript
   // ❌ Wrong - direct mutation
   function reducer_setUsername(state, dispatch) {
       state.username = dispatch.payload; // Direct mutation!
       return state;
   }

   // ✅ Correct - use utility
   function reducer_setUsername(state, dispatch) {
       return parseDispatchAndSetState({
           dispatch,
           key: "username",
           state,
           zSchema: setUsernameLoginDispatchSchema,
       });
   }
   ```

5. **Unsorted Order**: Not maintaining alphabetical order
   ```typescript
   // ❌ Wrong
   const map = new Map([
       [action.setUsername, reducer_setUsername],
       [action.setAge, reducer_setAge], // Out of order!
       [action.setIsLoading, reducer_setIsLoading],
   ]);

   // ✅ Correct
   const map = new Map([
       [action.setAge, reducer_setAge],
       [action.setIsLoading, reducer_setIsLoading],
       [action.setUsername, reducer_setUsername],
   ]);
   ```

## 🎪 Complete Examples

### Example 1: Dashboard Reducers

```typescript
import type { DashboardState } from "./state";
import type { DashboardDispatch } from "./dispatches";
import { dashboardAction } from "./actions";
import {
    setCurrentViewDashboardDispatchSchema,
    setErrorMessageDashboardDispatchSchema,
    setIsLoadingDashboardDispatchSchema,
    setMetricsDataDashboardDispatchSchema,
    setSelectedFiltersDashboardDispatchSchema,
    setWorkerDashboardDispatchSchema,
} from "./dispatches";
import { parseDispatchAndSetState } from "../../utils";

function dashboardReducer(
    state: DashboardState,
    dispatch: DashboardDispatch,
): DashboardState {
    const reducer = dashboardReducersMap.get(dispatch.action);
    return reducer ? reducer(state, dispatch) : state;
}

const dashboardReducersMap: Map<
    DashboardAction[keyof DashboardAction],
    (state: DashboardState, dispatch: DashboardDispatch) => DashboardState
> = new Map([
    [dashboardAction.setCurrentView, dashboardReducer_setCurrentView],
    [dashboardAction.setErrorMessage, dashboardReducer_setErrorMessage],
    [dashboardAction.setIsLoading, dashboardReducer_setIsLoading],
    [dashboardAction.setMetricsData, dashboardReducer_setMetricsData],
    [dashboardAction.setSelectedFilters, dashboardReducer_setSelectedFilters],
    [dashboardAction.setWorker, dashboardReducer_setWorker],
]);

function dashboardReducer_setCurrentView(
    state: DashboardState,
    dispatch: DashboardDispatch,
): DashboardState {
    return parseDispatchAndSetState({
        dispatch,
        key: "currentView",
        state,
        zSchema: setCurrentViewDashboardDispatchSchema,
    });
}

function dashboardReducer_setErrorMessage(
    state: DashboardState,
    dispatch: DashboardDispatch,
): DashboardState {
    return parseDispatchAndSetState({
        dispatch,
        key: "errorMessage",
        state,
        zSchema: setErrorMessageDashboardDispatchSchema,
    });
}

function dashboardReducer_setIsLoading(
    state: DashboardState,
    dispatch: DashboardDispatch,
): DashboardState {
    return parseDispatchAndSetState({
        dispatch,
        key: "isLoading",
        state,
        zSchema: setIsLoadingDashboardDispatchSchema,
    });
}

function dashboardReducer_setMetricsData(
    state: DashboardState,
    dispatch: DashboardDispatch,
): DashboardState {
    return parseDispatchAndSetState({
        dispatch,
        key: "metricsData",
        state,
        zSchema: setMetricsDataDashboardDispatchSchema,
    });
}

function dashboardReducer_setSelectedFilters(
    state: DashboardState,
    dispatch: DashboardDispatch,
): DashboardState {
    return parseDispatchAndSetState({
        dispatch,
        key: "selectedFilters",
        state,
        zSchema: setSelectedFiltersDashboardDispatchSchema,
    });
}

function dashboardReducer_setWorker(
    state: DashboardState,
    dispatch: DashboardDispatch,
): DashboardState {
    return parseDispatchAndSetState({
        dispatch,
        key: "worker",
        state,
        zSchema: setWorkerDashboardDispatchSchema,
    });
}

export {
    dashboardReducer,
    dashboardReducer_setCurrentView,
    dashboardReducer_setErrorMessage,
    dashboardReducer_setIsLoading,
    dashboardReducer_setMetricsData,
    dashboardReducer_setSelectedFilters,
    dashboardReducer_setWorker,
    dashboardReducersMap,
};
```

### Example 2: Form Reducers

```typescript
import type { FormState } from "./state";
import type { FormDispatch } from "./dispatches";
import { formAction } from "./actions";
import {
    setEmailFormDispatchSchema,
    setErrorsFormDispatchSchema,
    setIsSubmittingFormDispatchSchema,
    setIsValidFormDispatchSchema,
} from "./dispatches";
import { parseDispatchAndSetState } from "../../utils";

function formReducer(
    state: FormState,
    dispatch: FormDispatch,
): FormState {
    const reducer = formReducersMap.get(dispatch.action);
    return reducer ? reducer(state, dispatch) : state;
}

const formReducersMap: Map<
    FormAction[keyof FormAction],
    (state: FormState, dispatch: FormDispatch) => FormState
> = new Map([
    [formAction.setEmail, formReducer_setEmail],
    [formAction.setErrors, formReducer_setErrors],
    [formAction.setIsSubmitting, formReducer_setIsSubmitting],
    [formAction.setIsValid, formReducer_setIsValid],
]);

function formReducer_setEmail(
    state: FormState,
    dispatch: FormDispatch,
): FormState {
    return parseDispatchAndSetState({
        dispatch,
        key: "email",
        state,
        zSchema: setEmailFormDispatchSchema,
    });
}

function formReducer_setErrors(
    state: FormState,
    dispatch: FormDispatch,
): FormState {
    return parseDispatchAndSetState({
        dispatch,
        key: "errors",
        state,
        zSchema: setErrorsFormDispatchSchema,
    });
}

function formReducer_setIsSubmitting(
    state: FormState,
    dispatch: FormDispatch,
): FormState {
    return parseDispatchAndSetState({
        dispatch,
        key: "isSubmitting",
        state,
        zSchema: setIsSubmittingFormDispatchSchema,
    });
}

function formReducer_setIsValid(
    state: FormState,
    dispatch: FormDispatch,
): FormState {
    return parseDispatchAndSetState({
        dispatch,
        key: "isValid",
        state,
        zSchema: setIsValidFormDispatchSchema,
    });
}

export {
    formReducer,
    formReducer_setEmail,
    formReducer_setErrors,
    formReducer_setIsSubmitting,
    formReducer_setIsValid,
    formReducersMap,
};
```

## 💡 Pro Tips

1. **Testing Reducers**: Export individual reducer functions for unit testing:
   ```typescript
   export {
       dashboardReducer,
       dashboardReducer_setIsLoading, // For testing
       dashboardReducersMap,
   };
   ```

2. **Custom Logic**: If you need custom logic beyond simple state updates, add
   it before calling the utility:
   ```typescript
   function loginReducer_setUsername(
       state: LoginState,
       dispatch: LoginDispatch,
   ): LoginState {
       // Custom validation or side effects
       console.log("Setting username:", dispatch.payload);

       // Then use utility for state update
       return parseDispatchAndSetState({
           dispatch,
           key: "username",
           state,
           zSchema: setUsernameLoginDispatchSchema,
       });
   }
   ```

3. **Debugging**: The utility handles errors gracefully - check console for
   validation errors

4. **Performance**: The Map lookup is O(1), making this pattern very efficient
   even with many actions
