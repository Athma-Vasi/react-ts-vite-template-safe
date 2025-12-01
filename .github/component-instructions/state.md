# State Generation Guide

Generate type-safe state with proper initial values in `state.ts` within the
component directory.

## Pattern

**Naming**: `{ComponentName}State` type and `initial{ComponentName}State`
constant\
**Location**: `src/components/{component}/state.ts`\
**Export**: Named exports for both type and constant\
**Order**: Fields alphabetically sorted in type and initial state

```typescript
type LoginState = {
    forageWorkerMaybe: Option<Worker>;
    isLoading: boolean;
    responseData: Array<unknown>;
    setSafeErrorMaybe: Option<Err<SafeError>>;
    username: string;
};

const initialLoginState: LoginState = {
    forageWorkerMaybe: None,
    isLoading: false,
    responseData: [],
    setSafeErrorMaybe: None,
    username: "",
};

export { initialLoginState };
export type { LoginState };
```

## Default Values by Type

| Type          | Initial Value        | Example                                  |
| ------------- | -------------------- | ---------------------------------------- |
| `string`      | `""`                 | `username: string` → `""`                |
| `number`      | `0`                  | `age: number` → `0`                      |
| `boolean`     | `false`              | `isLoading: boolean` → `false`           |
| `Option<T>`   | `None`               | `workerMaybe: Option<Worker>` → `None`   |
| `T[]`         | `[]`                 | `items: string[]` → `[]`                 |
| `Record<K,V>` | `{}`                 | `errors: Record<string, string>` → `{}`  |
| `"a" \| "b"`  | First variant        | `status: "idle" \| "loading"` → `"idle"` |
| `{...}`       | Object with defaults | `{theme: string}` → `{theme: "light"}`   |

## Rules

1. ✅ Use `ComponentNameState`, not `ComponentStateType`
2. ✅ Alphabetize all fields in both type and initial state
3. ✅ Match initial values to types exactly (no type assertions)
4. ✅ Use `Option<T>` and `None` for nullable fields
5. ✅ Export both type and constant with named exports
6. ❌ Never use `null` for non-nullable types
7. ❌ Never skip alphabetical sorting

## Adding Fields

Insert new field alphabetically in both type and initial state:

```typescript
// Before
type LoginState = {
    isLoading: boolean;
    username: string;
};

// After adding password
type LoginState = {
    isLoading: boolean;
    password: string; // ← Added alphabetically
    username: string;
};

const initialLoginState: LoginState = {
    isLoading: false,
    password: "", // ← Added with correct default
    username: "",
};
```

## Examples

```typescript
// Dashboard with unions and Options
type DashboardState = {
    currentView: "customers" | "products" | "financial";
    errorMessage: string;
    isLoading: boolean;
    metricsDataMaybe: Option<MetricsData>;
    safeErrorMaybe: Option<Err<SafeError>>;
    selectedFilters: string[];
    workerMaybe: Option<Worker>;
};

const initialDashboardState: DashboardState = {
    currentView: "customers",
    errorMessage: "",
    isLoading: false,
    metricsDataMaybe: None,
    safeErrorMaybe: None,
    selectedFilters: [],
    workerMaybe: None,
};

// Form with primitives and Records
type UserFormState = {
    email: string;
    errors: Record<string, string>;
    isSubmitting: boolean;
    isValid: boolean;
    name: string;
    submitCount: number;
};

const initialUserFormState: UserFormState = {
    email: "",
    errors: {},
    isSubmitting: false,
    isValid: false,
    name: "",
    submitCount: 0,
};
```
