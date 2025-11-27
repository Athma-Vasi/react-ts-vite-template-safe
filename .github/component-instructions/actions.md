# Actions Generation Guide 🎯

## 📋 Purpose

Generate type-safe action constants that correspond to state setters. Each state
field automatically gets a corresponding action with the pattern
`set{FieldName}`.

## 📍 File Location

- **Create** `actions.ts` in the same directory as `state.ts`
- **Example**: `src/components/login/actions.ts`
- **Convention**: Name pattern should be `{ComponentName}Actions` to match
  `{ComponentName}State`

## 🎯 Basic Pattern

Given a state type **LoginState** with fields:

```typescript
type LoginState = {
    username: string;
    isLoading: boolean;
    forageWorker: Worker | null;
};
```

Generate the following in `actions.ts`:

```typescript
type LoginActions = {
    [K in keyof LoginState as `set${Capitalize<string & K>}`]: `set${Capitalize<
        string & K
    >}`;
};

const loginActions: LoginActions = {
    setForageWorker: "setForageWorker",
    setIsLoading: "setIsLoading",
    setUsername: "setUsername",
};

export { loginActions };
export type { LoginActions };
```

**Key Points**:

- Actions are sorted **alphabetically** for consistency
- Uses TypeScript mapped types for automatic synchronization with state
- Both the type and constant are exported

## ➕ Adding to Existing Actions

If `actions.ts` already exists with:

```typescript
type LoginActions = {
    [K in keyof LoginState as `set${Capitalize<string & K>}`]: `set${Capitalize<
        string & K
    >}`;
};

const loginActions: LoginActions = {
    setIsLoading: "setIsLoading",
    setUsername: "setUsername",
};

export { loginActions };
export type { LoginActions };
```

And you need to add a new state field `password: string`:

1. **Update the state type first** (in `state.ts`)
2. **Add to the constant object** maintaining alphabetical order:

```typescript
type LoginActions = {
    [K in keyof LoginState as `set${Capitalize<string & K>}`]: `set${Capitalize<
        string & K
    >}`;
};

const loginActions: LoginActions = {
    setIsLoading: "setIsLoading",
    setPassword: "setPassword", // ← New action added
    setUsername: "setUsername",
};

export { loginActions };
export type { LoginActions };
```

**Note**: The mapped type automatically includes the new field, you only need to
add it to the constant object.

## ✨ Best Practices

1. **Naming Convention**: Use `ComponentNameActions` to match your state type
   `ComponentNameState`
   - ✅ `LoginActions` with `LoginState`
   - ❌ `LoginActions` with `RegisterState`

2. **Alphabetical Order**: Keep actions sorted alphabetically for easier
   scanning and consistency

3. **Mapped Types**: Always use the mapped type pattern for automatic
   synchronization with state changes

4. **Named Exports**: Export both type and constant using named exports (not
   default)

5. **File Co-location**: Place `actions.ts` next to `state.ts` in the component
   directory

6. **Single Source of Truth**: The state type is the source of truth; actions
   derive from it

## ⚠️ Common Mistakes

1. **Mismatched Naming**: Using `LoginActions` with `RegisterState` (breaks the
   mapped type)
2. **Forgetting Exports**: Not exporting both the type and the constant
3. **Wrong Capitalization**: Action should be `setUsername`, not `setusername`
   or `SetUsername`
4. **Unsorted Actions**: Not maintaining alphabetical order in the constant
   object
5. **Manual Duplication**: Not using mapped types, leading to sync issues with
   state

## 🎪 Complete Example

Given this state:

```typescript
type DashboardState = {
    currentView: "customers" | "products" | "financial";
    isLoading: boolean;
    metricsData: MetricsData | null;
    selectedFilters: string[];
    worker: Worker | null;
};
```

Generate these actions:

```typescript
type DashboardActions = {
    [K in keyof DashboardState as `set${Capitalize<string & K>}`]:
        `set${Capitalize<
            string & K
        >}`;
};

const dashboardActions: DashboardActions = {
    setCurrentView: "setCurrentView",
    setIsLoading: "setIsLoading",
    setMetricsData: "setMetricsData",
    setSelectedFilters: "setSelectedFilters",
    setWorker: "setWorker",
};

export { dashboardActions };
export type { DashboardActions };
```
