# Dispatches Generation Guide

Generate Zod-validated dispatch schemas for runtime type-safe state updates in
`dispatches.ts` within the component directory.

## Pattern

**Naming**: `set{FieldName}{ComponentName}DispatchSchema` schemas and
`{ComponentName}Dispatch` union type\
**Location**: `src/components/{component}/dispatches.ts`\
**Export**: Named exports for all schemas and union type\
**Order**: Schemas alphabetically sorted by field name\
**Validation**: Each schema validates both action literal and payload type

```typescript
import { z } from "zod";
import { loginActions } from "./actions";

const setForageWorkerMaybeLoginDispatchSchema = z.object({
    action: z.literal(loginActions.setForageWorkerMaybe),
    payload: z.instanceof(Worker).nullable(),
});

const setIsLoadingLoginDispatchSchema = z.object({
    action: z.literal(loginActions.setIsLoading),
    payload: z.boolean(),
});

const setResponseDataLoginDispatchSchema = z.object({
    action: z.literal(loginActions.setResponseData),
    payload: z.array(z.unknown()),
});

const setSafeErrorMaybeLoginDispatchSchema = z.object({
    action: z.literal(loginActions.setSafeErrorMaybe),
    payload: z.instanceof(Object).nullable(), // Or specific Err schema
});

const setUsernameLoginDispatchSchema = z.object({
    action: z.literal(loginActions.setUsername),
    payload: z.string(),
});

type LoginDispatch =
    | z.infer<typeof setForageWorkerMaybeLoginDispatchSchema>
    | z.infer<typeof setIsLoadingLoginDispatchSchema>
    | z.infer<typeof setResponseDataLoginDispatchSchema>
    | z.infer<typeof setSafeErrorMaybeLoginDispatchSchema>
    | z.infer<typeof setUsernameLoginDispatchSchema>;

export {
    setForageWorkerMaybeLoginDispatchSchema,
    setIsLoadingLoginDispatchSchema,
    setResponseDataLoginDispatchSchema,
    setSafeErrorMaybeLoginDispatchSchema,
    setUsernameLoginDispatchSchema,
};
export type { LoginDispatch };
```

## TypeScript to Zod Mapping

| TypeScript Type               | Zod Schema                           |
| ----------------------------- | ------------------------------------ |
| `string`                      | `z.string()`                         |
| `number`                      | `z.number()`                         |
| `boolean`                     | `z.boolean()`                        |
| `Option<T>` (from ts-results) | `createOptionSchema(val: Schema<T>)` |
| `T[]`                         | `z.array(zSchema)`                   |
| `Record<K,V>`                 | `z.record(zValueSchema)`             |
| `"a" \| "b"`                  | `z.enum(["a", "b"])`                 |
| `string \| number`            | `z.union([z.string(), z.number()])`  |
| `Worker`, `Date`, etc.        | `z.instanceof(Worker)`, `z.date()`   |
| `{prop: string}`              | `z.object({prop: z.string()})`       |
| `unknown`                     | `z.unknown()`                        |
| `T \| null`                   | `zSchema.nullable()`                 |
| `T?` (optional)               | `zSchema.optional()`                 |

## Rules

1. ✅ Use `set{FieldName}{ComponentName}DispatchSchema` for schema names
2. ✅ Import actions from `./actions` and use `z.literal()` for action field
3. ✅ Alphabetize schemas in definitions, union type, and exports
4. ✅ Match payload schema exactly to state field type
5. ✅ Export all schemas individually for testing/reuse
6. ✅ Export union type with named export
7. ✅ Use `z.infer<typeof schema>` to derive types from schemas
8. ❌ Never hardcode action strings (use imported action constants)
9. ❌ Never skip alphabetical sorting

## Adding Fields

Insert new schema alphabetically in schema definitions, union type, and exports:

```typescript
// Before
const setIsLoadingLoginDispatchSchema = z.object({
    action: z.literal(loginActions.setIsLoading),
    payload: z.boolean(),
});

const setUsernameLoginDispatchSchema = z.object({
    action: z.literal(loginActions.setUsername),
    payload: z.string(),
});

type LoginDispatch =
    | z.infer<typeof setIsLoadingLoginDispatchSchema>
    | z.infer<typeof setUsernameLoginDispatchSchema>;

// After adding password: string
const setIsLoadingLoginDispatchSchema = z.object({
    action: z.literal(loginActions.setIsLoading),
    payload: z.boolean(),
});

const setPasswordLoginDispatchSchema = z.object({ // ← Added alphabetically
    action: z.literal(loginActions.setPassword),
    payload: z.string(),
});

const setUsernameLoginDispatchSchema = z.object({
    action: z.literal(loginActions.setUsername),
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
```

## Examples

```typescript
// Dashboard with enums, arrays, Options
import { z } from "zod";
import { dashboardActions } from "./actions";

const setCurrentViewDashboardDispatchSchema = z.object({
    action: z.literal(dashboardActions.setCurrentView),
    payload: z.enum(["customers", "products", "financial"]),
});

const setErrorMessageDashboardDispatchSchema = z.object({
    action: z.literal(dashboardActions.setErrorMessage),
    payload: z.string(),
});

const setIsLoadingDashboardDispatchSchema = z.object({
    action: z.literal(dashboardActions.setIsLoading),
    payload: z.boolean(),
});

const setMetricsDataMaybeDashboardDispatchSchema = z.object({
    action: z.literal(dashboardActions.setMetricsDataMaybe),
    payload: createOptionSchema(metrics_data_schema), // Assuming metrics_data_schema is defined
});

const setSelectedFiltersDashboardDispatchSchema = z.object({
    action: z.literal(dashboardActions.setSelectedFilters),
    payload: z.array(z.string()),
});

const setWorkerMaybeDashboardDispatchSchema = z.object({
    action: z.literal(dashboardActions.setWorkerMaybe),
    payload: createOptionSchema(z.instanceof(Worker)),
});

type DashboardDispatch =
    | z.infer<typeof setCurrentViewDashboardDispatchSchema>
    | z.infer<typeof setErrorMessageDashboardDispatchSchema>
    | z.infer<typeof setIsLoadingDashboardDispatchSchema>
    | z.infer<typeof setMetricsDataMaybeDashboardDispatchSchema>
    | z.infer<typeof setSelectedFiltersDashboardDispatchSchema>
    | z.infer<typeof setWorkerMaybeDashboardDispatchSchema>;

export {
    setCurrentViewDashboardDispatchSchema,
    setErrorMessageDashboardDispatchSchema,
    setIsLoadingDashboardDispatchSchema,
    setMetricsDataMaybeDashboardDispatchSchema,
    setSelectedFiltersDashboardDispatchSchema,
    setWorkerMaybeDashboardDispatchSchema,
};
export type { DashboardDispatch };

// Form with Records and nested objects
import { z } from "zod";
import { userFormActions } from "./actions";

const setEmailUserFormDispatchSchema = z.object({
    action: z.literal(userFormActions.setEmail),
    payload: z.string(),
});

const setErrorsUserFormDispatchSchema = z.object({
    action: z.literal(userFormActions.setErrors),
    payload: z.record(z.string()), // Record<string, string>
});

const setIsSubmittingUserFormDispatchSchema = z.object({
    action: z.literal(userFormActions.setIsSubmitting),
    payload: z.boolean(),
});

const setIsValidUserFormDispatchSchema = z.object({
    action: z.literal(userFormActions.setIsValid),
    payload: z.boolean(),
});

const setNameUserFormDispatchSchema = z.object({
    action: z.literal(userFormActions.setName),
    payload: z.string(),
});

const setSubmitCountUserFormDispatchSchema = z.object({
    action: z.literal(userFormActions.setSubmitCount),
    payload: z.number(),
});

type UserFormDispatch =
    | z.infer<typeof setEmailUserFormDispatchSchema>
    | z.infer<typeof setErrorsUserFormDispatchSchema>
    | z.infer<typeof setIsSubmittingUserFormDispatchSchema>
    | z.infer<typeof setIsValidUserFormDispatchSchema>
    | z.infer<typeof setNameUserFormDispatchSchema>
    | z.infer<typeof setSubmitCountUserFormDispatchSchema>;

export {
    setEmailUserFormDispatchSchema,
    setErrorsUserFormDispatchSchema,
    setIsSubmittingUserFormDispatchSchema,
    setIsValidUserFormDispatchSchema,
    setNameUserFormDispatchSchema,
    setSubmitCountUserFormDispatchSchema,
};
export type { UserFormDispatch };
```

## Advanced Patterns

**Reusable schemas for complex types:**

```typescript
const metrics_data_schema = z.object({
    revenue: z.number(),
    customers: z.number(),
    growth: z.number(),
});

const setMetricsDataMaybeDispatchSchema = z.object({
    action: z.literal(actions.setMetricsDataMaybe),
    payload: createOptionSchema(metrics_data_schema),
});
```

**Custom validations with refinements:**

```typescript
const setEmailDispatchSchema = z.object({
    action: z.literal(actions.setEmail),
    payload: z.string().email(), // Built-in email validation
});

const setAgeDispatchSchema = z.object({
    action: z.literal(actions.setAge),
    payload: z.number().int().positive().max(120), // Chained validations
});
```

**Passthrough for dynamic Records:**

```typescript
// For Record<string, unknown> with dynamic keys
const setMetadataDispatchSchema = z.object({
    action: z.literal(actions.setMetadata),
    payload: z.object({}).passthrough(), // Allows any keys
});
```
