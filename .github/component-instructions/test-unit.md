# Unit Test Generation Guide

Generate comprehensive Vitest unit tests for reducer functions in
`{componentName}.test.ts` within the component directory.

## Pattern

**Naming**: `{componentName}.test.ts` (named after component folder)\
**Location**: `src/components/{component}/{componentName}.test.ts`\
**Framework**: Vitest with `describe`, `it`, `expect`\
**Order**: Test suites alphabetically sorted by action name\
**Coverage**: Test both valid inputs (state updates) and invalid inputs (state
unchanged)

```typescript
import { describe, expect, it } from "vitest";
import { loginActions } from "./actions";
import {
    setForageWorkerMaybeLoginDispatchSchema,
    setIsLoadingLoginDispatchSchema,
    setUsernameLoginDispatchSchema,
} from "./dispatches";
import {
    loginReducer_setForageWorkerMaybe,
    loginReducer_setIsLoading,
    loginReducer_setUsername,
} from "./reducers";
import { initialLoginState } from "./state";
import {
    invalid_booleans,
    invalid_strings,
    valid_booleans,
    valid_strings,
} from "../../constants";

describe("loginReducer", () => {
    describe(loginActions.setForageWorkerMaybe, () => {
        it("should allow valid Worker instance", () => {
            const worker = new Worker("");
            const dispatch = {
                action: loginActions.setForageWorkerMaybe,
                payload: worker,
            };
            const state = loginReducer_setForageWorkerMaybe(
                initialLoginState,
                dispatch,
            );
            expect(state.forageWorkerMaybe).toBe(worker);
        });

        it("should allow null value", () => {
            const dispatch = {
                action: loginActions.setForageWorkerMaybe,
                payload: null,
            };
            const state = loginReducer_setForageWorkerMaybe(
                initialLoginState,
                dispatch,
            );
            expect(state.forageWorkerMaybe).toBe(null);
        });

        it("should not allow invalid Worker values", () => {
            const initial = initialLoginState.forageWorkerMaybe;
            const invalidValues = ["not a worker", 123, {}, []];

            invalidValues.forEach((value) => {
                const dispatch = {
                    action: loginActions.setForageWorkerMaybe,
                    payload: value,
                };
                const state = loginReducer_setForageWorkerMaybe(
                    initialLoginState,
                    dispatch as any,
                );
                expect(state.forageWorkerMaybe).toBe(initial);
            });
        });
    });

    describe(loginActions.setIsLoading, () => {
        it("should allow valid boolean values", () => {
            valid_booleans.forEach((value) => {
                const dispatch = {
                    action: loginActions.setIsLoading,
                    payload: value,
                };
                const state = loginReducer_setIsLoading(
                    initialLoginState,
                    dispatch,
                );
                expect(state.isLoading).toBe(value);
            });
        });

        it("should not allow invalid boolean values", () => {
            const initial = initialLoginState.isLoading;

            invalid_booleans.forEach((value) => {
                const dispatch = {
                    action: loginActions.setIsLoading,
                    payload: value,
                };
                const state = loginReducer_setIsLoading(
                    initialLoginState,
                    dispatch as any,
                );
                expect(state.isLoading).toBe(initial);
            });
        });
    });

    describe(loginActions.setUsername, () => {
        it("should allow valid string values", () => {
            valid_strings.forEach((value) => {
                const dispatch = {
                    action: loginActions.setUsername,
                    payload: value,
                };
                const state = loginReducer_setUsername(
                    initialLoginState,
                    dispatch,
                );
                expect(state.username).toBe(value);
            });
        });

        it("should not allow invalid string values", () => {
            const initial = initialLoginState.username;

            invalid_strings.forEach((value) => {
                const dispatch = {
                    action: loginActions.setUsername,
                    payload: value,
                };
                const state = loginReducer_setUsername(
                    initialLoginState,
                    dispatch as any,
                );
                expect(state.username).toBe(initial);
            });
        });
    });
});
```

## Test Patterns by Type

| Type          | Valid Test Data                               | Invalid Test Data               | Assertion   |
| ------------- | --------------------------------------------- | ------------------------------- | ----------- |
| `string`      | `valid_strings` constant                      | `invalid_strings` constant      | `toBe()`    |
| `number`      | `valid_numbers` constant                      | `invalid_numbers` constant      | `toBe()`    |
| `boolean`     | `valid_booleans` constant                     | `invalid_booleans` constant     | `toBe()`    |
| `T \| null`   | Valid instance + `null`                       | `["invalid", 123, {}, []]`      | `toBe()`    |
| `T[]`         | `[[], [item], [item1, item2]]`                | `["not array", 123, null, {}]`  | `toEqual()` |
| `Record<K,V>` | `[{}, {key: "value"}]`                        | `["not object", 123, null, []]` | `toEqual()` |
| `"a" \| "b"`  | `["a", "b"]`                                  | `["invalid", "c", 123, null]`   | `toBe()`    |
| `{...}`       | Objects matching shape                        | `["not object", 123, null, []]` | `toEqual()` |
| `Worker`      | `new Worker("")`                              | `["not worker", 123, {}, []]`   | `toBe()`    |
| `Option<T>`   | Valid value + `null` (Option from ts-results) | Invalid type values             | `toBe()`    |

## Rules

1. ✅ Name test file after component folder: `login.test.ts`, not
   `state.test.ts`
2. ✅ Alphabetize `describe` blocks by action name
3. ✅ Test both valid (state updates) and invalid (state unchanged) inputs
4. ✅ Import test constants from `../../constants` (lowercase_snake_case)
5. ✅ Use `as any` for invalid value tests to bypass TypeScript
6. ✅ Save initial value before testing invalid inputs
7. ✅ Use `toBe()` for primitives, `toEqual()` for arrays/objects
8. ❌ Never skip invalid input tests
9. ❌ Never forget to save initial state value for comparison

## Adding Fields

Insert new test suite alphabetically:

```typescript
// Before
describe("loginReducer", () => {
    describe(loginActions.setIsLoading, () => {/* ... */});
    describe(loginActions.setUsername, () => {/* ... */});
});

// After adding password: string
import { loginReducer_setPassword } from "./reducers"; // ← Import
import { setPasswordLoginDispatchSchema } from "./dispatches";

describe("loginReducer", () => {
    describe(loginActions.setIsLoading, () => {/* ... */});

    describe(loginActions.setPassword, () => { // ← New test suite
        it("should allow valid string values", () => {
            valid_strings.forEach((value) => {
                const dispatch = {
                    action: loginActions.setPassword,
                    payload: value,
                };
                const state = loginReducer_setPassword(
                    initialLoginState,
                    dispatch,
                );
                expect(state.password).toBe(value);
            });
        });

        it("should not allow invalid string values", () => {
            const initial = initialLoginState.password;
            invalid_strings.forEach((value) => {
                const dispatch = {
                    action: loginActions.setPassword,
                    payload: value,
                };
                const state = loginReducer_setPassword(
                    initialLoginState,
                    dispatch as any,
                );
                expect(state.password).toBe(initial);
            });
        });
    });

    describe(loginActions.setUsername, () => {/* ... */});
});
```

## Examples

```typescript
// Dashboard with unions, arrays, Options
import { describe, expect, it } from "vitest";
import { dashboardActions } from "./actions";
import {
    setCurrentViewDashboardDispatchSchema,
    setErrorMessageDashboardDispatchSchema,
    setIsLoadingDashboardDispatchSchema,
    setMetricsDataMaybeDashboardDispatchSchema,
    setSelectedFiltersDashboardDispatchSchema,
    setWorkerMaybeDashboardDispatchSchema,
} from "./dispatches";
import {
    dashboardReducer_setCurrentView,
    dashboardReducer_setErrorMessage,
    dashboardReducer_setIsLoading,
    dashboardReducer_setMetricsDataMaybe,
    dashboardReducer_setSelectedFilters,
    dashboardReducer_setWorkerMaybe,
} from "./reducers";
import { initialDashboardState } from "./state";
import {
    invalid_booleans,
    invalid_strings,
    valid_booleans,
    valid_strings,
} from "../../constants";

describe("dashboardReducer", () => {
    describe(dashboardActions.setCurrentView, () => {
        it("should allow valid view values", () => {
            const validViews = ["customers", "products", "financial"];
            validViews.forEach((value) => {
                const dispatch = {
                    action: dashboardActions.setCurrentView,
                    payload: value,
                };
                const state = dashboardReducer_setCurrentView(
                    initialDashboardState,
                    dispatch,
                );
                expect(state.currentView).toBe(value);
            });
        });

        it("should not allow invalid view values", () => {
            const initial = initialDashboardState.currentView;
            const invalidViews = ["invalid", "repairs", 123, null];
            invalidViews.forEach((value) => {
                const dispatch = {
                    action: dashboardActions.setCurrentView,
                    payload: value,
                };
                const state = dashboardReducer_setCurrentView(
                    initialDashboardState,
                    dispatch as any,
                );
                expect(state.currentView).toBe(initial);
            });
        });
    });

    describe(dashboardActions.setErrorMessage, () => {
        it("should allow valid string values", () => {
            valid_strings.forEach((value) => {
                const dispatch = {
                    action: dashboardActions.setErrorMessage,
                    payload: value,
                };
                const state = dashboardReducer_setErrorMessage(
                    initialDashboardState,
                    dispatch,
                );
                expect(state.errorMessage).toBe(value);
            });
        });

        it("should not allow invalid string values", () => {
            const initial = initialDashboardState.errorMessage;
            invalid_strings.forEach((value) => {
                const dispatch = {
                    action: dashboardActions.setErrorMessage,
                    payload: value,
                };
                const state = dashboardReducer_setErrorMessage(
                    initialDashboardState,
                    dispatch as any,
                );
                expect(state.errorMessage).toBe(initial);
            });
        });
    });

    describe(dashboardActions.setIsLoading, () => {
        it("should allow valid boolean values", () => {
            valid_booleans.forEach((value) => {
                const dispatch = {
                    action: dashboardActions.setIsLoading,
                    payload: value,
                };
                const state = dashboardReducer_setIsLoading(
                    initialDashboardState,
                    dispatch,
                );
                expect(state.isLoading).toBe(value);
            });
        });

        it("should not allow invalid boolean values", () => {
            const initial = initialDashboardState.isLoading;
            invalid_booleans.forEach((value) => {
                const dispatch = {
                    action: dashboardActions.setIsLoading,
                    payload: value,
                };
                const state = dashboardReducer_setIsLoading(
                    initialDashboardState,
                    dispatch as any,
                );
                expect(state.isLoading).toBe(initial);
            });
        });
    });

    describe(dashboardActions.setSelectedFilters, () => {
        it("should allow valid string array", () => {
            const validArrays = [[], ["filter1"], ["filter1", "filter2"]];
            validArrays.forEach((value) => {
                const dispatch = {
                    action: dashboardActions.setSelectedFilters,
                    payload: value,
                };
                const state = dashboardReducer_setSelectedFilters(
                    initialDashboardState,
                    dispatch,
                );
                expect(state.selectedFilters).toEqual(value);
            });
        });

        it("should not allow invalid array values", () => {
            const initial = initialDashboardState.selectedFilters;
            const invalidValues = ["not array", 123, null, { filters: [] }];
            invalidValues.forEach((value) => {
                const dispatch = {
                    action: dashboardActions.setSelectedFilters,
                    payload: value,
                };
                const state = dashboardReducer_setSelectedFilters(
                    initialDashboardState,
                    dispatch as any,
                );
                expect(state.selectedFilters).toEqual(initial);
            });
        });
    });

    describe(dashboardActions.setWorkerMaybe, () => {
        it("should allow valid Worker instance", () => {
            const worker = new Worker("");
            const dispatch = {
                action: dashboardActions.setWorkerMaybe,
                payload: worker,
            };
            const state = dashboardReducer_setWorkerMaybe(
                initialDashboardState,
                dispatch,
            );
            expect(state.workerMaybe).toBe(worker);
        });

        it("should allow null value", () => {
            const dispatch = {
                action: dashboardActions.setWorkerMaybe,
                payload: null,
            };
            const state = dashboardReducer_setWorkerMaybe(
                initialDashboardState,
                dispatch,
            );
            expect(state.workerMaybe).toBe(null);
        });

        it("should not allow invalid Worker values", () => {
            const initial = initialDashboardState.workerMaybe;
            const invalidValues = ["not a worker", 123, {}, []];
            invalidValues.forEach((value) => {
                const dispatch = {
                    action: dashboardActions.setWorkerMaybe,
                    payload: value,
                };
                const state = dashboardReducer_setWorkerMaybe(
                    initialDashboardState,
                    dispatch as any,
                );
                expect(state.workerMaybe).toBe(initial);
            });
        });
    });
});

// Form with Records
import { describe, expect, it } from "vitest";
import { userFormActions } from "./actions";
import {
    setEmailUserFormDispatchSchema,
    setErrorsUserFormDispatchSchema,
    setIsSubmittingUserFormDispatchSchema,
    setIsValidUserFormDispatchSchema,
    setNameUserFormDispatchSchema,
    setSubmitCountUserFormDispatchSchema,
} from "./dispatches";
import {
    userFormReducer_setEmail,
    userFormReducer_setErrors,
    userFormReducer_setIsSubmitting,
    userFormReducer_setIsValid,
    userFormReducer_setName,
    userFormReducer_setSubmitCount,
} from "./reducers";
import { initialUserFormState } from "./state";
import {
    invalid_booleans,
    invalid_numbers,
    invalid_strings,
    valid_booleans,
    valid_numbers,
    valid_strings,
} from "../../constants";

describe("userFormReducer", () => {
    describe(userFormActions.setEmail, () => {
        it("should allow valid string values", () => {
            valid_strings.forEach((value) => {
                const dispatch = {
                    action: userFormActions.setEmail,
                    payload: value,
                };
                const state = userFormReducer_setEmail(
                    initialUserFormState,
                    dispatch,
                );
                expect(state.email).toBe(value);
            });
        });

        it("should not allow invalid string values", () => {
            const initial = initialUserFormState.email;
            invalid_strings.forEach((value) => {
                const dispatch = {
                    action: userFormActions.setEmail,
                    payload: value,
                };
                const state = userFormReducer_setEmail(
                    initialUserFormState,
                    dispatch as any,
                );
                expect(state.email).toBe(initial);
            });
        });
    });

    describe(userFormActions.setErrors, () => {
        it("should allow valid Record values", () => {
            const validRecords = [{}, { field: "error" }, { a: "1", b: "2" }];
            validRecords.forEach((value) => {
                const dispatch = {
                    action: userFormActions.setErrors,
                    payload: value,
                };
                const state = userFormReducer_setErrors(
                    initialUserFormState,
                    dispatch,
                );
                expect(state.errors).toEqual(value);
            });
        });

        it("should not allow invalid Record values", () => {
            const initial = initialUserFormState.errors;
            const invalidValues = ["not object", 123, null, []];
            invalidValues.forEach((value) => {
                const dispatch = {
                    action: userFormActions.setErrors,
                    payload: value,
                };
                const state = userFormReducer_setErrors(
                    initialUserFormState,
                    dispatch as any,
                );
                expect(state.errors).toEqual(initial);
            });
        });
    });

    describe(userFormActions.setSubmitCount, () => {
        it("should allow valid number values", () => {
            valid_numbers.forEach((value) => {
                const dispatch = {
                    action: userFormActions.setSubmitCount,
                    payload: value,
                };
                const state = userFormReducer_setSubmitCount(
                    initialUserFormState,
                    dispatch,
                );
                expect(state.submitCount).toBe(value);
            });
        });

        it("should not allow invalid number values", () => {
            const initial = initialUserFormState.submitCount;
            invalid_numbers.forEach((value) => {
                const dispatch = {
                    action: userFormActions.setSubmitCount,
                    payload: value,
                };
                const state = userFormReducer_setSubmitCount(
                    initialUserFormState,
                    dispatch as any,
                );
                expect(state.submitCount).toBe(initial);
            });
        });
    });
});
```

## Advanced Patterns

**Nested describe blocks for organization:**

```typescript
describe("dashboardReducer", () => {
    describe("view management", () => {
        describe(actions.setCurrentView, () => {/* ... */});
        describe(actions.setSelectedFilters, () => {/* ... */});
    });

    describe("loading states", () => {
        describe(actions.setIsLoading, () => {/* ... */});
        describe(actions.setErrorMessage, () => {/* ... */});
    });
});
```

**Testing edge cases:**

```typescript
it("should allow edge case values", () => {
    const edgeCases = ["", "   ", "a".repeat(1000)]; // Empty, spaces, long
    edgeCases.forEach((value) => {
        const dispatch = { action: actions.setUsername, payload: value };
        const state = reducer_setUsername(initialState, dispatch);
        expect(state.username).toBe(value);
    });
});
```

**Running tests:**

```bash
npm run test          # Run once
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```
