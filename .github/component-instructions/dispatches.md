# Dispatches Generation Guide 🎯

## 📋 Purpose

Generate Zod-validated dispatch schemas and types for state updates. Each state
field gets a corresponding dispatch schema that validates the action and payload
at runtime, ensuring type safety and catching errors early.

## 📍 File Location

- **Create** `dispatches.ts` in the component's directory
- **Example**: `src/components/login/dispatches.ts`
- **Convention**: Name pattern should be
  `set{FieldName}{ComponentName}DispatchSchema` and `{ComponentName}Dispatch`

## 🎯 Basic Pattern

Given a state type **LoginState** with fields:

```typescript
type LoginState = {
    forageWorkerMaybe: Option<Worker>;
    isLoading: boolean;
    username: string;
    setSafeErrorMaybe: Option<Err<SafeError>>;
};
```

Generate the following in `dispatches.ts`:

```typescript
import { z } from "zod";
import { loginAction } from "./actions";

const setForageWorkerLoginDispatchSchema = z.object({
    action: z.literal(loginAction.setForageWorker),
    payload: z.instanceof(Worker).nullable(),
});

const setIsLoadingLoginDispatchSchema = z.object({
    action: z.literal(loginAction.setIsLoading),
    payload: z.boolean(),
});

const setUsernameLoginDispatchSchema = z.object({
    action: z.literal(loginAction.setUsername),
    payload: z.string(),
});

type LoginDispatch =
    | z.infer<typeof setForageWorkerLoginDispatchSchema>
    | z.infer<typeof setIsLoadingLoginDispatchSchema>
    | z.infer<typeof setUsernameLoginDispatchSchema>;

export {
    setForageWorkerLoginDispatchSchema,
    setIsLoadingLoginDispatchSchema,
    setUsernameLoginDispatchSchema,
};
export type { LoginDispatch };
```

**Key Points**:

- Dispatch schemas are sorted **alphabetically** by field name
- Each schema validates both action and payload
- Exports are also sorted alphabetically
- The union type includes all dispatch schemas

## ➕ Adding to Existing Dispatches

If `dispatches.ts` already exists with:

```typescript
import { z } from "zod";
import { loginAction } from "./actions";

const setIsLoadingLoginDispatchSchema = z.object({
    action: z.literal(loginAction.setIsLoading),
    payload: z.boolean(),
});

const setUsernameLoginDispatchSchema = z.object({
    action: z.literal(loginAction.setUsername),
    payload: z.string(),
});

type LoginDispatch =
    | z.infer<typeof setIsLoadingLoginDispatchSchema>
    | z.infer<typeof setUsernameLoginDispatchSchema>;

export { setIsLoadingLoginDispatchSchema, setUsernameLoginDispatchSchema };
export type { LoginDispatch };
```

And you need to add a new field `password: string`:

**Add new schema, update union type, and export** maintaining alphabetical
order:

```typescript
import { z } from "zod";
import { loginAction } from "./actions";

const setIsLoadingLoginDispatchSchema = z.object({
    action: z.literal(loginAction.setIsLoading),
    payload: z.boolean(),
});

const setPasswordLoginDispatchSchema = z.object({ // ← New schema added
    action: z.literal(loginAction.setPassword),
    payload: z.string(),
});

const setUsernameLoginDispatchSchema = z.object({
    action: z.literal(loginAction.setUsername),
    payload: z.string(),
});

type LoginDispatch =
    | z.infer<typeof setIsLoadingLoginDispatchSchema>
    | z.infer<typeof setPasswordLoginDispatchSchema> // ← Added to union
    | z.infer<typeof setUsernameLoginDispatchSchema>;

export {
    setIsLoadingLoginDispatchSchema,
    setPasswordLoginDispatchSchema, // ← Added to exports
    setUsernameLoginDispatchSchema,
};
export type { LoginDispatch };
```

## 🔧 Zod Schemas by Type

Map TypeScript types to appropriate Zod validators:

### Primitives

```typescript
// String
username: string;
// Zod: z.string()

// Number
age: number;
// Zod: z.number()

// Boolean
isLoading: boolean;
// Zod: z.boolean()
```

### Nullable Types

```typescript
// Nullable Object
worker: Worker | null;
// Zod: z.instanceof(Worker).nullable()

// Nullable String
message: string | null;
// Zod: z.string().nullable()

// Nullable Array
items: string[] | null;
// Zod: z.array(z.string()).nullable()
```

### Optional Types

```typescript
// Optional String
bio?: string;
// Zod: z.string().optional()

// Optional Number
count?: number;
// Zod: z.number().optional()
```

### Arrays

```typescript
// String Array
tags: string[];
// Zod: z.array(z.string())

// Number Array
scores: number[];
// Zod: z.array(z.number())

// Object Array
users: User[];
// Zod: z.array(UserSchema)  // Requires User schema definition
```

### Objects

```typescript
// Object with known shape
config: {
    theme: string;
    locale: string;
}
// Zod: z.object({ theme: z.string(), locale: z.string() })

// Record type
metadata: Record<string, unknown>;
// Zod: z.record(z.unknown())

// Record with string values
settings: Record<string, string>;
// Zod: z.record(z.string())
```

### Union Types

```typescript
// String union
status: "idle" | "loading" | "success" | "error";
// Zod: z.enum(['idle', 'loading', 'success', 'error'])

// Multiple types union
value: string | number;
// Zod: z.union([z.string(), z.number()])
```

### Complex Types

```typescript
// Instance of class
worker: Worker;
// Zod: z.instanceof(Worker)

// Date
timestamp: Date;
// Zod: z.date()

// Function (rarely dispatched, but possible)
callback: () => void;
// Zod: z.function()

// Unknown type
data: unknown;
// Zod: z.unknown()

// Any type (avoid if possible)
value: any;
// Zod: z.any()
```

## ✨ Best Practices

1. **Naming Convention**: Use `set{FieldName}{ComponentName}DispatchSchema` for
   schemas
   - ✅ `setUsernameLoginDispatchSchema`
   - ❌ `usernameDispatch` or `setUsernameZod`

2. **Alphabetical Order**: Keep schemas, union types, and exports sorted
   alphabetically

3. **Import Actions**: Always import from `./actions` to ensure action literals
   are correct

4. **Validate Early**: Use strict Zod validators to catch issues at dispatch
   time, not reducer time

5. **Nullable vs Optional**:
   - Nullable: Use `.nullable()` for fields that can be `null`
   - Optional: Use `.optional()` for fields that may not be present

6. **Export Everything**: Export all dispatch schemas for testing and reuse

7. **Union Type Order**: Match the alphabetical order of schemas in the union
   type

## ⚠️ Common Mistakes

1. **Wrong Zod Schema**: Using incorrect validator for the type
   ```typescript
   // ❌ Wrong
   worker: Worker | null;
   payload: z.instanceof(Worker),  // Missing .nullable()!

   // ✅ Correct
   worker: Worker | null;
   payload: z.instanceof(Worker).nullable(),
   ```

2. **Missing Action Import**: Hardcoding action strings instead of using
   imported constants
   ```typescript
   // ❌ Wrong
   action: z.literal("setUsername"),

   // ✅ Correct
   action: z.literal(loginAction.setUsername),
   ```

3. **Unsorted Order**: Not maintaining alphabetical order
   ```typescript
   // ❌ Wrong
   type Dispatch =
       | z.infer<typeof setUsernameDispatchSchema>
       | z.infer<typeof setAgeDispatchSchema>
       | z.infer<typeof setIsLoadingDispatchSchema>;

   // ✅ Correct
   type Dispatch =
       | z.infer<typeof setAgeDispatchSchema>
       | z.infer<typeof setIsLoadingDispatchSchema>
       | z.infer<typeof setUsernameDispatchSchema>;
   ```

4. **Missing Exports**: Not exporting all schemas
   ```typescript
   // ❌ Wrong
   export { setUsernameDispatchSchema }; // Missing other schemas!

   // ✅ Correct
   export {
       setIsLoadingDispatchSchema,
       setPasswordDispatchSchema,
       setUsernameDispatchSchema,
   };
   ```

5. **Type Mismatch**: Schema doesn't match the state type
   ```typescript
   // State: count: number;
   // ❌ Wrong
   payload: z.string(),  // Wrong type!

   // ✅ Correct
   payload: z.number(),
   ```

## 🎪 Complete Examples

### Example 1: Dashboard Dispatches

```typescript
import { z } from "zod";
import { dashboardAction } from "./actions";

const setCurrentViewDashboardDispatchSchema = z.object({
    action: z.literal(dashboardAction.setCurrentView),
    payload: z.enum(["customers", "products", "financial"]),
});

const setErrorMessageDashboardDispatchSchema = z.object({
    action: z.literal(dashboardAction.setErrorMessage),
    payload: z.string(),
});

const setIsLoadingDashboardDispatchSchema = z.object({
    action: z.literal(dashboardAction.setIsLoading),
    payload: z.boolean(),
});

const setMetricsDataDashboardDispatchSchema = z.object({
    action: z.literal(dashboardAction.setMetricsData),
    payload: z.instanceof(Object).nullable(), // Or specific schema
});

const setSelectedFiltersDashboardDispatchSchema = z.object({
    action: z.literal(dashboardAction.setSelectedFilters),
    payload: z.array(z.string()),
});

const setWorkerDashboardDispatchSchema = z.object({
    action: z.literal(dashboardAction.setWorker),
    payload: z.instanceof(Worker).nullable(),
});

type DashboardDispatch =
    | z.infer<typeof setCurrentViewDashboardDispatchSchema>
    | z.infer<typeof setErrorMessageDashboardDispatchSchema>
    | z.infer<typeof setIsLoadingDashboardDispatchSchema>
    | z.infer<typeof setMetricsDataDashboardDispatchSchema>
    | z.infer<typeof setSelectedFiltersDashboardDispatchSchema>
    | z.infer<typeof setWorkerDashboardDispatchSchema>;

export {
    setCurrentViewDashboardDispatchSchema,
    setErrorMessageDashboardDispatchSchema,
    setIsLoadingDashboardDispatchSchema,
    setMetricsDataDashboardDispatchSchema,
    setSelectedFiltersDashboardDispatchSchema,
    setWorkerDashboardDispatchSchema,
};
export type { DashboardDispatch };
```

### Example 2: Form Dispatches with Record Types

```typescript
import { z } from "zod";
import { formAction } from "./actions";

const setEmailFormDispatchSchema = z.object({
    action: z.literal(formAction.setEmail),
    payload: z.string(),
});

const setErrorsFormDispatchSchema = z.object({
    action: z.literal(formAction.setErrors),
    payload: z.record(z.string()),
});

const setIsSubmittingFormDispatchSchema = z.object({
    action: z.literal(formAction.setIsSubmitting),
    payload: z.boolean(),
});

const setIsValidFormDispatchSchema = z.object({
    action: z.literal(formAction.setIsValid),
    payload: z.boolean(),
});

type FormDispatch =
    | z.infer<typeof setEmailFormDispatchSchema>
    | z.infer<typeof setErrorsFormDispatchSchema>
    | z.infer<typeof setIsSubmittingFormDispatchSchema>
    | z.infer<typeof setIsValidFormDispatchSchema>;

export {
    setEmailFormDispatchSchema,
    setErrorsFormDispatchSchema,
    setIsSubmittingFormDispatchSchema,
    setIsValidFormDispatchSchema,
};
export type { FormDispatch };
```

### Example 3: Complex Types with Optional Fields

```typescript
import { z } from "zod";
import { profileAction } from "./actions";

const setAvatarProfileDispatchSchema = z.object({
    action: z.literal(profileAction.setAvatar),
    payload: z.string().nullable(),
});

const setBioProfileDispatchSchema = z.object({
    action: z.literal(profileAction.setBio),
    payload: z.string().optional(), // Optional field
});

const setIsEditingProfileDispatchSchema = z.object({
    action: z.literal(profileAction.setIsEditing),
    payload: z.boolean(),
});

const setPreferencesProfileDispatchSchema = z.object({
    action: z.literal(profileAction.setPreferences),
    payload: z.object({
        notifications: z.boolean(),
        theme: z.enum(["light", "dark"]),
    }),
});

type ProfileDispatch =
    | z.infer<typeof setAvatarProfileDispatchSchema>
    | z.infer<typeof setBioProfileDispatchSchema>
    | z.infer<typeof setIsEditingProfileDispatchSchema>
    | z.infer<typeof setPreferencesProfileDispatchSchema>;

export {
    setAvatarProfileDispatchSchema,
    setBioProfileDispatchSchema,
    setIsEditingProfileDispatchSchema,
    setPreferencesProfileDispatchSchema,
};
export type { ProfileDispatch };
```

## 💡 Pro Tips

1. **Reusable Schemas**: For complex types used multiple times, define them
   separately:
   ```typescript
   const UserSchema = z.object({
       id: z.string(),
       name: z.string(),
       email: z.string(),
   });

   const setUserDispatchSchema = z.object({
       action: z.literal(action.setUser),
       payload: UserSchema,
   });
   ```

2. **Refinements**: Add custom validation when needed:
   ```typescript
   const setEmailDispatchSchema = z.object({
       action: z.literal(action.setEmail),
       payload: z.string().email(), // Email validation
   });
   ```

3. **Testing**: Export schemas for easy testing:
   ```typescript
   // In tests
   expect(setUsernameDispatchSchema.safeParse(dispatch).success).toBe(true);
   ```
