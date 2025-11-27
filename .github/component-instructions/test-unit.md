# Unit Test Generation Guide 🎯

## 📋 Purpose

Generate comprehensive Vitest unit tests for reducer functions. Tests should
validate that reducers correctly handle both valid and invalid inputs, ensuring
type safety and proper state updates through the `parseDispatchAndSetState`
utility.

## 📍 File Location

- **Create** `{componentName}.test.ts` in the component's directory
- **Example**: `src/components/login/login.test.ts`
- **Convention**: Test file should be named after the component folder, not
  individual files

## 🎯 Basic Pattern

Given a state type **LoginState** with fields:

```typescript
type LoginState = {
    forageWorker: Worker | null;
    isLoading: boolean;
    username: string;
};
```

Generate the following in `login.test.ts`:

```typescript
import { describe, expect, it } from "vitest";
import { loginAction } from "./actions";
import {
    setForageWorkerLoginDispatchSchema,
    setIsLoadingLoginDispatchSchema,
    setUsernameLoginDispatchSchema,
} from "./dispatches";
import {
    loginReducer_setForageWorker,
    loginReducer_setIsLoading,
    loginReducer_setUsername,
} from "./reducers";
import { initialLoginState } from "./state";
import {
    INVALID_BOOLEANS,
    INVALID_STRINGS,
    VALID_BOOLEANS,
    VALID_STRINGS,
} from "../../constants";

describe("loginReducer", () => {
    describe(loginAction.setForageWorker, () => {
        it("should allow valid Worker instance", () => {
            const worker = new Worker("");
            const dispatch = {
                action: loginAction.setForageWorker,
                payload: worker,
            };
            const state = loginReducer_setForageWorker(
                initialLoginState,
                dispatch,
            );
            expect(state.forageWorker).toBe(worker);
        });

        it("should allow null value", () => {
            const dispatch = {
                action: loginAction.setForageWorker,
                payload: null,
            };
            const state = loginReducer_setForageWorker(
                initialLoginState,
                dispatch,
            );
            expect(state.forageWorker).toBe(null);
        });

        it("should not allow invalid Worker values", () => {
            const initialWorker = initialLoginState.forageWorker;
            const invalidValues = ["not a worker", 123, {}, []];

            invalidValues.forEach((value) => {
                const dispatch = {
                    action: loginAction.setForageWorker,
                    payload: value,
                };
                const state = loginReducer_setForageWorker(
                    initialLoginState,
                    dispatch as any,
                );
                expect(state.forageWorker).toBe(initialWorker);
            });
        });
    });

    describe(loginAction.setIsLoading, () => {
        it("should allow valid boolean values", () => {
            VALID_BOOLEANS.forEach((value) => {
                const dispatch = {
                    action: loginAction.setIsLoading,
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
            const initialIsLoading = initialLoginState.isLoading;

            INVALID_BOOLEANS.forEach((value) => {
                const dispatch = {
                    action: loginAction.setIsLoading,
                    payload: value,
                };
                const state = loginReducer_setIsLoading(
                    initialLoginState,
                    dispatch as any,
                );
                expect(state.isLoading).toBe(initialIsLoading);
            });
        });
    });

    describe(loginAction.setUsername, () => {
        it("should allow valid string values", () => {
            VALID_STRINGS.forEach((value) => {
                const dispatch = {
                    action: loginAction.setUsername,
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
            const initialUsername = initialLoginState.username;

            INVALID_STRINGS.forEach((value) => {
                const dispatch = {
                    action: loginAction.setUsername,
                    payload: value,
                };
                const state = loginReducer_setUsername(
                    initialLoginState,
                    dispatch as any,
                );
                expect(state.username).toBe(initialUsername);
            });
        });
    });
});
```

**Key Points**:

- Test suites are sorted **alphabetically** by action name
- Each action gets a `describe` block
- Test both valid and invalid inputs
- Use constants from `../../constants` for test data
- Use `as any` type assertion for invalid value tests
- Verify state remains unchanged for invalid inputs

## ➕ Adding to Existing Tests

If `login.test.ts` already exists with tests for `username` and `isLoading`, and
you need to add tests for `password: string`:

**Add new describe block** maintaining alphabetical order:

```typescript
import { describe, expect, it } from "vitest";
import { loginAction } from "./actions";
import {
    setIsLoadingLoginDispatchSchema,
    setPasswordLoginDispatchSchema, // ← New import
    setUsernameLoginDispatchSchema,
} from "./dispatches";
import {
    loginReducer_setIsLoading,
    loginReducer_setPassword, // ← New import
    loginReducer_setUsername,
} from "./reducers";
import { initialLoginState } from "./state";
import {
    INVALID_BOOLEANS,
    INVALID_STRINGS,
    VALID_BOOLEANS,
    VALID_STRINGS,
} from "../../constants";

describe("loginReducer", () => {
    describe(loginAction.setIsLoading, () => {
        // ... existing tests
    });

    describe(loginAction.setPassword, () => { // ← New test block
        it("should allow valid string values", () => {
            VALID_STRINGS.forEach((value) => {
                const dispatch = {
                    action: loginAction.setPassword,
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
            const initialPassword = initialLoginState.password;

            INVALID_STRINGS.forEach((value) => {
                const dispatch = {
                    action: loginAction.setPassword,
                    payload: value,
                };
                const state = loginReducer_setPassword(
                    initialLoginState,
                    dispatch as any,
                );
                expect(state.password).toBe(initialPassword);
            });
        });
    });

    describe(loginAction.setUsername, () => {
        // ... existing tests
    });
});
```

## 🔧 Test Patterns by Type

Different types require different test approaches:

### Primitives

#### String

```typescript
describe(action.setUsername, () => {
    it("should allow valid string values", () => {
        VALID_STRINGS.forEach((value) => {
            const dispatch = { action: action.setUsername, payload: value };
            const state = reducer_setUsername(initialState, dispatch);
            expect(state.username).toBe(value);
        });
    });

    it("should not allow invalid string values", () => {
        const initial = initialState.username;
        INVALID_STRINGS.forEach((value) => {
            const dispatch = { action: action.setUsername, payload: value };
            const state = reducer_setUsername(initialState, dispatch as any);
            expect(state.username).toBe(initial);
        });
    });
});
```

#### Number

```typescript
describe(action.setAge, () => {
    it("should allow valid number values", () => {
        VALID_NUMBERS.forEach((value) => {
            const dispatch = { action: action.setAge, payload: value };
            const state = reducer_setAge(initialState, dispatch);
            expect(state.age).toBe(value);
        });
    });

    it("should not allow invalid number values", () => {
        const initial = initialState.age;
        INVALID_NUMBERS.forEach((value) => {
            const dispatch = { action: action.setAge, payload: value };
            const state = reducer_setAge(initialState, dispatch as any);
            expect(state.age).toBe(initial);
        });
    });
});
```

#### Boolean

```typescript
describe(action.setIsLoading, () => {
    it("should allow valid boolean values", () => {
        VALID_BOOLEANS.forEach((value) => {
            const dispatch = { action: action.setIsLoading, payload: value };
            const state = reducer_setIsLoading(initialState, dispatch);
            expect(state.isLoading).toBe(value);
        });
    });

    it("should not allow invalid boolean values", () => {
        const initial = initialState.isLoading;
        INVALID_BOOLEANS.forEach((value) => {
            const dispatch = { action: action.setIsLoading, payload: value };
            const state = reducer_setIsLoading(initialState, dispatch as any);
            expect(state.isLoading).toBe(initial);
        });
    });
});
```

### Nullable Types

```typescript
describe(action.setWorker, () => {
    it("should allow valid Worker instance", () => {
        const worker = new Worker("");
        const dispatch = { action: action.setWorker, payload: worker };
        const state = reducer_setWorker(initialState, dispatch);
        expect(state.worker).toBe(worker);
    });

    it("should allow null value", () => {
        const dispatch = { action: action.setWorker, payload: null };
        const state = reducer_setWorker(initialState, dispatch);
        expect(state.worker).toBe(null);
    });

    it("should not allow invalid Worker values", () => {
        const initial = initialState.worker;
        const invalidValues = ["not a worker", 123, {}, []];
        invalidValues.forEach((value) => {
            const dispatch = { action: action.setWorker, payload: value };
            const state = reducer_setWorker(initialState, dispatch as any);
            expect(state.worker).toBe(initial);
        });
    });
});
```

### Arrays

```typescript
describe(action.setTags, () => {
    it("should allow valid string array", () => {
        const validArrays = [[], ["tag1"], ["tag1", "tag2", "tag3"]];
        validArrays.forEach((value) => {
            const dispatch = { action: action.setTags, payload: value };
            const state = reducer_setTags(initialState, dispatch);
            expect(state.tags).toEqual(value);
        });
    });

    it("should not allow invalid array values", () => {
        const initial = initialState.tags;
        const invalidValues = ["not array", 123, null, { array: [] }];
        invalidValues.forEach((value) => {
            const dispatch = { action: action.setTags, payload: value };
            const state = reducer_setTags(initialState, dispatch as any);
            expect(state.tags).toEqual(initial);
        });
    });
});
```

### Objects

```typescript
describe(action.setConfig, () => {
    it("should allow valid config object", () => {
        const validConfigs = [
            { theme: "light", locale: "en" },
            { theme: "dark", locale: "fr" },
        ];
        validConfigs.forEach((value) => {
            const dispatch = { action: action.setConfig, payload: value };
            const state = reducer_setConfig(initialState, dispatch);
            expect(state.config).toEqual(value);
        });
    });

    it("should not allow invalid config values", () => {
        const initial = initialState.config;
        const invalidValues = ["not object", 123, null, []];
        invalidValues.forEach((value) => {
            const dispatch = { action: action.setConfig, payload: value };
            const state = reducer_setConfig(initialState, dispatch as any);
            expect(state.config).toEqual(initial);
        });
    });
});
```

### Union Types

```typescript
describe(action.setStatus, () => {
    it("should allow valid status values", () => {
        const validStatuses = ["idle", "loading", "success", "error"];
        validStatuses.forEach((value) => {
            const dispatch = { action: action.setStatus, payload: value };
            const state = reducer_setStatus(initialState, dispatch);
            expect(state.status).toBe(value);
        });
    });

    it("should not allow invalid status values", () => {
        const initial = initialState.status;
        const invalidValues = ["invalid", "pending", 123, null];
        invalidValues.forEach((value) => {
            const dispatch = { action: action.setStatus, payload: value };
            const state = reducer_setStatus(initialState, dispatch as any);
            expect(state.status).toBe(initial);
        });
    });
});
```

## ✨ Best Practices

1. **Test Organization**:
   - One `describe` block per action
   - Alphabetically sorted describe blocks
   - Descriptive test names: "should allow valid X values"

2. **Use Constants**: Import validation constants from `../../constants`:
   - `VALID_STRINGS`, `INVALID_STRINGS`
   - `VALID_NUMBERS`, `INVALID_NUMBERS`
   - `VALID_BOOLEANS`, `INVALID_BOOLEANS`

3. **Test Both Paths**:
   - ✅ Valid inputs → state updates correctly
   - ✅ Invalid inputs → state remains unchanged

4. **Type Assertions**: Use `as any` for invalid value tests to bypass
   TypeScript

5. **Initial State**: Save initial value to verify it doesn't change on invalid
   input

6. **Array/Object Comparison**: Use `toEqual()` instead of `toBe()` for
   reference types

7. **Edge Cases**: Test edge cases like empty strings, zero, null, undefined

## ⚠️ Common Mistakes

1. **Wrong Comparison Method**: Using `toBe()` for objects/arrays
   ```typescript
   // ❌ Wrong - toBe checks reference equality
   expect(state.tags).toBe(["tag1", "tag2"]);

   // ✅ Correct - toEqual checks deep equality
   expect(state.tags).toEqual(["tag1", "tag2"]);
   ```

2. **Missing Type Assertion**: Not using `as any` for invalid tests
   ```typescript
   // ❌ Wrong - TypeScript error
   const dispatch = { action: action.setAge, payload: "invalid" };

   // ✅ Correct
   const dispatch = { action: action.setAge, payload: "invalid" };
   const state = reducer(initialState, dispatch as any);
   ```

3. **Not Testing Invalid Inputs**: Only testing happy path
   ```typescript
   // ❌ Incomplete - missing invalid input test
   it("should allow valid values", () => {/* ... */});

   // ✅ Complete - both paths tested
   it("should allow valid values", () => {/* ... */});
   it("should not allow invalid values", () => {/* ... */});
   ```

4. **Forgetting to Save Initial Value**: Can't verify unchanged state
   ```typescript
   // ❌ Wrong - nothing to compare against
   INVALID_STRINGS.forEach((value) => {
       const state = reducer(initialState, dispatch as any);
       expect(state.username).toBe(???);  // What should it be?
   });

   // ✅ Correct
   const initialUsername = initialState.username;
   INVALID_STRINGS.forEach((value) => {
       const state = reducer(initialState, dispatch as any);
       expect(state.username).toBe(initialUsername);
   });
   ```

5. **Unsorted Test Blocks**: Not maintaining alphabetical order
   ```typescript
   // ❌ Wrong
   describe(action.setUsername, () => {/* ... */});
   describe(action.setAge, () => {/* ... */});
   describe(action.setIsLoading, () => {/* ... */});

   // ✅ Correct
   describe(action.setAge, () => {/* ... */});
   describe(action.setIsLoading, () => {/* ... */});
   describe(action.setUsername, () => {/* ... */});
   ```

## 🎪 Complete Example: Dashboard Tests

```typescript
import { describe, expect, it } from "vitest";
import { dashboardAction } from "./actions";
import {
    setCurrentViewDashboardDispatchSchema,
    setErrorMessageDashboardDispatchSchema,
    setIsLoadingDashboardDispatchSchema,
    setMetricsDataDashboardDispatchSchema,
    setSelectedFiltersDashboardDispatchSchema,
    setWorkerDashboardDispatchSchema,
} from "./dispatches";
import {
    dashboardReducer_setCurrentView,
    dashboardReducer_setErrorMessage,
    dashboardReducer_setIsLoading,
    dashboardReducer_setMetricsData,
    dashboardReducer_setSelectedFilters,
    dashboardReducer_setWorker,
} from "./reducers";
import { initialDashboardState } from "./state";
import {
    INVALID_BOOLEANS,
    INVALID_STRINGS,
    VALID_BOOLEANS,
    VALID_STRINGS,
} from "../../constants";

describe("dashboardReducer", () => {
    describe(dashboardAction.setCurrentView, () => {
        it("should allow valid view values", () => {
            const validViews = ["customers", "products", "financial"];
            validViews.forEach((value) => {
                const dispatch = {
                    action: dashboardAction.setCurrentView,
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
                    action: dashboardAction.setCurrentView,
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

    describe(dashboardAction.setErrorMessage, () => {
        it("should allow valid string values", () => {
            VALID_STRINGS.forEach((value) => {
                const dispatch = {
                    action: dashboardAction.setErrorMessage,
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
            INVALID_STRINGS.forEach((value) => {
                const dispatch = {
                    action: dashboardAction.setErrorMessage,
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

    describe(dashboardAction.setIsLoading, () => {
        it("should allow valid boolean values", () => {
            VALID_BOOLEANS.forEach((value) => {
                const dispatch = {
                    action: dashboardAction.setIsLoading,
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
            INVALID_BOOLEANS.forEach((value) => {
                const dispatch = {
                    action: dashboardAction.setIsLoading,
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

    describe(dashboardAction.setSelectedFilters, () => {
        it("should allow valid string array", () => {
            const validArrays = [[], ["filter1"], ["filter1", "filter2"]];
            validArrays.forEach((value) => {
                const dispatch = {
                    action: dashboardAction.setSelectedFilters,
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
                    action: dashboardAction.setSelectedFilters,
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

    describe(dashboardAction.setWorker, () => {
        it("should allow valid Worker instance", () => {
            const worker = new Worker("");
            const dispatch = {
                action: dashboardAction.setWorker,
                payload: worker,
            };
            const state = dashboardReducer_setWorker(
                initialDashboardState,
                dispatch,
            );
            expect(state.worker).toBe(worker);
        });

        it("should allow null value", () => {
            const dispatch = {
                action: dashboardAction.setWorker,
                payload: null,
            };
            const state = dashboardReducer_setWorker(
                initialDashboardState,
                dispatch,
            );
            expect(state.worker).toBe(null);
        });

        it("should not allow invalid Worker values", () => {
            const initial = initialDashboardState.worker;
            const invalidValues = ["not a worker", 123, {}, []];
            invalidValues.forEach((value) => {
                const dispatch = {
                    action: dashboardAction.setWorker,
                    payload: value,
                };
                const state = dashboardReducer_setWorker(
                    initialDashboardState,
                    dispatch as any,
                );
                expect(state.worker).toBe(initial);
            });
        });
    });
});
```

## 💡 Pro Tips

1. **Running Tests**: Use Vitest watch mode during development:
   ```bash
   npm run test:watch
   ```

2. **Test Coverage**: Check coverage to ensure all reducers are tested:
   ```bash
   npm run test:coverage
   ```

3. **Test-Driven Development**: Write tests before implementing reducers for
   better design

4. **Descriptive Failures**: Tests should clearly indicate what went wrong when
   they fail

5. **Group Related Tests**: Use nested `describe` blocks for complex testing
   scenarios:
   ```typescript
   describe("dashboardReducer", () => {
       describe("view management", () => {
           describe(action.setCurrentView, () => {/* ... */});
           describe(action.setSelectedFilters, () => {/* ... */});
       });

       describe("loading states", () => {
           describe(action.setIsLoading, () => {/* ... */});
           describe(action.setErrorMessage, () => {/* ... */});
       });
   });
   ```

6. **Snapshot Testing**: For complex objects, consider snapshot testing:
   ```typescript
   expect(state).toMatchSnapshot();
   ```
