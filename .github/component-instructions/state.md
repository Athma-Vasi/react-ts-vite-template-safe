# State Generation Guide 🎯

## 📋 Purpose

Generate type-safe state definitions with proper initial values. Each
component's state should have a clear type definition and a corresponding
initial state object with sensible default values.

## 📍 File Location

- **Create** `state.ts` in the component's directory
- **Example**: `src/components/login/state.ts`
- **Convention**: Name pattern should be `{ComponentName}State` and
  `initial{ComponentName}State`

## 🎯 Basic Pattern

Given state fields:

```typescript
username: string;
isLoading: boolean;
forageWorker: Worker | null;
```

Generate the following in `state.ts`:

```typescript
type LoginState = {
    forageWorker: Worker | null;
    isLoading: boolean;
    username: string;
};

const initialLoginState: LoginState = {
    forageWorker: null,
    isLoading: false,
    username: "",
};

export { initialLoginState };
export type { LoginState };
```

**Key Points**:

- Fields are sorted **alphabetically** in both type and initial state
- Initial values match the type requirements
- Both the type and constant are exported with named exports

## ➕ Adding to Existing State

If `state.ts` already exists with:

```typescript
type LoginState = {
    isLoading: boolean;
    username: string;
};

const initialLoginState: LoginState = {
    isLoading: false,
    username: "",
};

export { initialLoginState };
export type { LoginState };
```

And you need to add a new field `password: string`:

**Update both type and initial state** maintaining alphabetical order:

```typescript
type LoginState = {
    isLoading: boolean;
    password: string; // ← New field added
    username: string;
};

const initialLoginState: LoginState = {
    isLoading: false,
    password: "", // ← New initial value added
    username: "",
};

export { initialLoginState };
export type { LoginState };
```

## 🔧 Default Values by Type

Choose appropriate initial values based on the type:

### Primitives

```typescript
// String
username: string;
// Initial: ""

// Number
age: number;
// Initial: 0

// Boolean
isLoading: boolean;
// Initial: false
```

### Nullable Types

```typescript
// Nullable Object
worker: Worker | null;
// Initial: null

// Nullable Array
data: User[] | null;
// Initial: null

// Optional Field
metadata?: Record<string, unknown>;
// Initial: undefined (or omit from initial state)
```

### Arrays

```typescript
// Array (non-nullable)
items: string[];
// Initial: []

// Array of Objects
users: User[];
// Initial: []
```

### Objects

```typescript
// Object with known shape
config: {
    theme: string;
    locale: string;
}
// Initial: { theme: "light", locale: "en" }

// Record type
metadata: Record<string, unknown>;
// Initial: {}
```

### Union Types

```typescript
// Status union
status: "idle" | "loading" | "success" | "error";
// Initial: 'idle' (first/default state)

// Multiple types union
value: string | number;
// Initial: "" (prefer string as default)
```

### Complex Types

```typescript
// Nested object
user: { name: string; email: string } | null;
// Initial: null

// Function type
callback: (() => void) | null;
// Initial: null
```

## ✨ Best Practices

1. **Naming Convention**: Use `ComponentNameState` for type and
   `initialComponentNameState` for constant
   - ✅ `LoginState` and `initialLoginState`
   - ❌ `LoginStateType` or `loginInitialState`

2. **Alphabetical Order**: Keep fields sorted alphabetically in both type
   definition and initial state

3. **Type Safety**: Ensure initial values match the type exactly - no type
   assertions needed

4. **Nullable vs Optional**:
   - Use `field: Type | null` when field will be set later
   - Use `field?: Type` when field is truly optional
   - Initialize nullable as `null`, optional as `undefined` or omit

5. **Sensible Defaults**: Choose defaults that represent the "empty" or
   "initial" state of your component

6. **Named Exports**: Export both type and constant using named exports (not
   default)

## ⚠️ Common Mistakes

1. **Wrong Default Values**: Using `null` for required strings, or `0` for
   nullable numbers
   ```typescript
   // ❌ Wrong
   username: string;
   initialState = { username: null }; // Type error!

   // ✅ Correct
   username: string;
   initialState = { username: "" };
   ```

2. **Unsorted Fields**: Not maintaining alphabetical order
   ```typescript
   // ❌ Wrong
   type State = { username: string; isLoading: boolean; age: number };

   // ✅ Correct
   type State = { age: number; isLoading: boolean; username: string };
   ```

3. **Missing Exports**: Not exporting both type and constant

4. **Type Mismatch**: Initial state not matching the type definition
   ```typescript
   // ❌ Wrong
   type State = { count: number };
   const initial: State = { count: "0" }; // Type error!

   // ✅ Correct
   type State = { count: number };
   const initial: State = { count: 0 };
   ```

5. **Inconsistent Naming**: Using different naming patterns across components

## 🎪 Complete Examples

### Example 1: Dashboard State

```typescript
type DashboardState = {
    currentView: "customers" | "products" | "financial";
    errorMessage: string;
    isLoading: boolean;
    metricsData: MetricsData | null;
    selectedFilters: string[];
    worker: Worker | null;
};

const initialDashboardState: DashboardState = {
    currentView: "customers",
    errorMessage: "",
    isLoading: false,
    metricsData: null,
    selectedFilters: [],
    worker: null,
};

export { initialDashboardState };
export type { DashboardState };
```

### Example 2: Form State

```typescript
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

export { initialUserFormState };
export type { UserFormState };
```

### Example 3: Complex State with Optional Fields

```typescript
type ProfileState = {
    avatar: string | null;
    bio?: string;
    isEditing: boolean;
    lastUpdated: Date | null;
    preferences: {
        notifications: boolean;
        theme: "light" | "dark";
    };
    userId: string;
};

const initialProfileState: ProfileState = {
    avatar: null,
    // bio is optional, so we omit it
    isEditing: false,
    lastUpdated: null,
    preferences: {
        notifications: true,
        theme: "light",
    },
    userId: "",
};

export { initialProfileState };
export type { ProfileState };
```
