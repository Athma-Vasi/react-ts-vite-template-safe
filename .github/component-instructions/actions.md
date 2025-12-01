# Actions Generation Guide

Generate type-safe action constants mapped from state fields in `actions.ts`
within the component directory.

## Pattern

**Naming**: `{ComponentName}Actions` type and `{componentName}_Actions`
constant\
**Location**: `src/components/{component}/actions.ts`\
**Export**: Named exports for both type and constant\
**Order**: Actions alphabetically sorted in constant\
**Mapping**: Uses TypeScript mapped types to auto-generate `set{FieldName}` for
each state field

```typescript
type LoginActions = {
    [K in keyof LoginState as `set${Capitalize<string & K>}`]: `set${Capitalize<
        string & K
    >}`;
};

const loginActions: LoginActions = {
    setForageWorkerMaybe: "setForageWorkerMaybe",
    setIsLoading: "setIsLoading",
    setResponseData: "setResponseData",
    setSafeErrorMaybe: "setSafeErrorMaybe",
    setUsername: "setUsername",
};

export { loginActions };
export type { LoginActions };
```

## Rules

1. ✅ Use `ComponentNameActions` type matching `ComponentNameState`
2. ✅ Use camelCase for constant: `loginActions`, not `LoginActions`
3. ✅ Alphabetize all actions in constant object
4. ✅ Use mapped types for automatic synchronization with state
5. ✅ Export both type and constant with named exports
6. ❌ Never manually type action strings (mapped type handles this)
7. ❌ Never skip alphabetical sorting
8. ✅ If a field has Option<T> type, append "Maybe" to the action name

## Adding Fields

Insert new action alphabetically in constant (mapped type updates
automatically):

```typescript
// Before
const loginActions: LoginActions = {
    setIsLoading: "setIsLoading",
    setUsername: "setUsername",
};

// After adding password to state
const loginActions: LoginActions = {
    setIsLoading: "setIsLoading",
    setPassword: "setPassword", // ← Added alphabetically
    setUsername: "setUsername",
};
```

## Examples

```typescript
// Dashboard with multiple state fields
type DashboardActions = {
    [K in keyof DashboardState as `set${Capitalize<string & K>}`]:
        `set${Capitalize<string & K>}`;
};

const dashboardActions: DashboardActions = {
    setCurrentView: "setCurrentView",
    setErrorMessage: "setErrorMessage",
    setIsLoading: "setIsLoading",
    setMetricsDataMaybe: "setMetricsDataMaybe",
    setSafeErrorMaybe: "setSafeErrorMaybe",
    setSelectedFilters: "setSelectedFilters",
    setWorkerMaybe: "setWorkerMaybe",
};

// Form with simple fields
type UserFormActions = {
    [K in keyof UserFormState as `set${Capitalize<string & K>}`]:
        `set${Capitalize<string & K>}`;
};

const userFormActions: UserFormActions = {
    setEmail: "setEmail",
    setErrors: "setErrors",
    setIsSubmitting: "setIsSubmitting",
    setIsValid: "setIsValid",
    setName: "setName",
    setSubmitCount: "setSubmitCount",
};
```
