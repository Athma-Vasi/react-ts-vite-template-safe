# React + TypeScript + Vite Template (Safe)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646cff?logo=vite)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> A production-ready React + TypeScript + Vite template emphasizing type-safe
> error handling, defensive programming patterns, and accessibility-first
> component design for building robust, resilient web applications.

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Component Library](#-component-library)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Development Guidelines](#-development-guidelines)
- [Testing](#-testing)
- [Configuration](#-configuration)

## ✨ Features

### Type-Safe Error Handling

- **Functional Error Handling**: Leverages `ts-results` for `Result<T, E>` and
  `Option<T>` patterns
- **Zero Null/Undefined Bugs**: Eliminates runtime null/undefined errors through
  strict typing
- **Custom Error Hierarchy**: 20+ specialized error types (NetworkError,
  CacheError, ValidationError, etc.)
- **Structured Error Objects**: Complete metadata including stack traces,
  timestamps, and HTTP status codes
- **Error Boundaries**: React Error Boundary integration with
  `react-error-boundary`

### Web Workers Architecture

Production-ready Web Workers for offloading computation:

- **Fetch Worker** (`fetchWorker.ts`): HTTP requests with exponential backoff,
  jitter retry logic, and configurable timeouts
- **Cache Worker** (`cacheWorker.ts`): In-memory state management with
  persistent worker context
- **Forage Worker** (`forageWorker.ts`): IndexedDB operations via localforage
  with safe error handling
- **Type-Safe Communication**: All workers use structured message passing with
  `SafeResult` wrappers

### Accessible Component Library

Fully accessible, production-ready UI components:

- **AccessibleTextInput**: WCAG 2.1 compliant text inputs with live validation
  feedback
- **Screen Reader Support**: ARIA attributes, live regions, and proper semantic
  HTML
- **Keyboard Navigation**: Full keyboard accessibility with focus management
- **Visual Feedback**: Real-time validation with user-friendly error messages

### Robust Utilities

Battle-tested utility functions:

- `retryFetchSafe`: Network resilience with exponential backoff and jitter
- `parseSyncSafe`: Zod schema validation with comprehensive error handling
- `getCachedItemAsyncSafe`: Safe IndexedDB operations with typed results
- `parseDispatchAndSetState`: Type-safe reducer state updates with validation
- **Consistent API**: All utilities return `SafeResult<T>` for uniform error
  propagation

### Modern Tooling

- **Vite 7.2**: Lightning-fast HMR and optimized production builds
- **React 19.2**: Latest features with React Compiler for automatic optimization
- **Zod 4.1**: Runtime type validation and schema-based parsing
- **Vitest**: Fast unit testing with Web Worker support
- **TypeScript 5.9**: Strict mode with advanced type inference

### Developer Experience

- **Reducer Pattern**: Structured state management with Zod-validated dispatches
- **Component Instructions**: Automated component generation templates in
  `.github/component-instructions/`
- **Consistent Naming**: lowercase_snake_case for constants, PascalCase for
  components
- **Comprehensive Types**: Generic types with `Prettify`, `NonNullableObject`,
  and `SafeResult`
- **ESLint + TypeScript ESLint**: Strict linting with React-specific rules

## 🏗 Architecture

### State Management Pattern

```typescript
// Type-safe reducer pattern with Zod validation
State → Action → Dispatch → Schema Validation → Reducer → New State
```

### Worker Communication Flow

```typescript
Main Thread → Worker (via postMessage)
           ← SafeResult<T> (type-safe response)
```

### Error Handling Strategy

```typescript
// All async operations wrapped in SafeResult
try {
    const result = await operation();
    return createSafeSuccessResult(result);
} catch (error) {
    return createSafeErrorResult(new AppError(error));
}
```

## 🎨 Component Library

### Accessible Inputs

**AccessibleTextInput** - Production-ready accessible text input component

```tsx
<AccessibleTextInput
    name="email"
    label="Email Address"
    action={actions.setEmail}
    dispatch={dispatch}
    errorAction={errorActions.setErrors}
    errorDispatch={errorDispatch}
    value={state.email}
    validationRegexes={[
        [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
    ]}
    type="email"
    required
/>;
```

**Features:**

- Real-time validation with visual and screen reader feedback
- ARIA live regions for dynamic error messages
- Proper focus management and keyboard navigation
- Customizable validation rules via regex patterns
- Optional visually-hidden labels for minimal UI

### Error Components

**ErrorSuspenseHOC** - Higher-order component for error boundaries and Suspense

```tsx
const SafeComponent = ErrorSuspenseHOC(MyComponent);
```

**Features:**

- Combines Error Boundary and Suspense wrapper
- Custom error fallback UI
- Automatic error recovery with reset functionality
- Error logging and reporting hooks

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Modern browser with ES2022 support

### Installation

```bash
# Clone the repository
git clone https://github.com/Athma-Vasi/react-ts-vite-template-safe.git
cd react-ts-vite-template-safe

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

### Available Scripts

```bash
npm run dev      # Start development server with HMR
npm run build    # TypeScript check + production build
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
npm test         # Run Vitest unit tests
```

## 📁 Project Structure

```
react-ts-vite-template-safe/
├── .github/
│   └── component-instructions/  # Component generation templates
│       ├── state.md
│       ├── actions.md
│       ├── dispatches.md
│       ├── reducers.md
│       └── test-unit.md
├── src/
│   ├── components/
│   │   ├── accessibleInputs/
│   │   │   └── AccessibleTextInput.tsx
│   │   ├── error/
│   │   │   ├── ErrorFallback.tsx
│   │   │   ├── index.tsx (ErrorSuspenseHOC)
│   │   │   ├── state.ts
│   │   │   ├── actions.ts
│   │   │   ├── dispatches.ts
│   │   │   ├── reducers.ts
│   │   │   └── error.test.ts
│   │   └── register/
│   ├── workers/
│   │   ├── cacheWorker.ts
│   │   ├── fetchWorker.ts
│   │   └── forageWorker.ts
│   ├── constants.ts      # Application constants (lowercase_snake_case)
│   ├── errors.ts         # Custom error class hierarchy
│   ├── types.ts          # Core TypeScript type definitions
│   ├── utils.ts          # Safe utility functions
│   ├── schemas.ts        # Zod validation schemas
│   └── App.tsx
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## 👨‍💻 Development Guidelines

### Component Generation

Follow the structured approach in `.github/component-instructions/`:

1. **state.ts**: Define state types and initial values
2. **actions.ts**: Generate action constants with mapped types
3. **dispatches.ts**: Create Zod dispatch schemas
4. **reducers.ts**: Implement type-safe reducers
5. **test-unit.md**: Write comprehensive Vitest tests

### Naming Conventions

- **Components**: `PascalCase` (e.g., `AccessibleTextInput`)
- **Files**: `camelCase.tsx` or `kebab-case.ts`
- **Constants**: `lowercase_snake_case` (e.g., `fetch_timeout_ms`)
- **Types**: `PascalCase` (e.g., `SafeResult`, `ErrorState`)
- **Functions**: `camelCase` (e.g., `createSafeSuccessResult`)

### Type Safety Rules

1. Always use `SafeResult<T>` for async operations
2. Validate all external data with Zod schemas
3. Never use `any` - use `unknown` and narrow types
4. Prefer `null` over `undefined` for explicit empty values
5. Use `Option<T>` from ts-results for nullable values

## 🧪 Testing

### Running Tests

```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm test -- --coverage # Generate coverage report
```

### Test Structure

Tests follow the pattern in `.github/component-instructions/test-unit.md`:

```typescript
describe("componentReducer", () => {
    describe(actions.setField, () => {
        it("should allow valid values", () => {
            // Test valid inputs
        });

        it("should reject invalid values", () => {
            // Test invalid inputs with as any assertion
        });
    });
});
```

## ⚙️ Configuration

### React Compiler

React Compiler is enabled for automatic performance optimization. This may
impact development build times.

See [React Compiler Documentation](https://react.dev/learn/react-compiler) for
details.

### TypeScript Configuration

Strict mode enabled with:

- `strict: true`
- `noUncheckedIndexedAccess: true`
- `exactOptionalPropertyTypes: true`

### ESLint Configuration

For production applications, enable type-aware lint rules:

```js
export default defineConfig([
    globalIgnores(["dist"]),
    {
        files: ["**/*.{ts,tsx}"],
        extends: [
            tseslint.configs.recommendedTypeChecked,
            // or tseslint.configs.strictTypeChecked
            tseslint.configs.stylisticTypeChecked,
        ],
        languageOptions: {
            parserOptions: {
                project: ["./tsconfig.node.json", "./tsconfig.app.json"],
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
]);
```

## 🎯 Use Cases

Perfect for applications requiring:

- **High Reliability**: Mission-critical applications with zero-downtime
  requirements
- **Accessibility**: WCAG 2.1 AA/AAA compliant web applications
- **Type Safety**: Complex data flows requiring compile-time guarantees
- **Offline Support**: Progressive Web Apps with IndexedDB caching
- **Heavy Computation**: CPU-intensive operations offloaded to Web Workers
- **Network Resilience**: Applications with unreliable network conditions

## 📚 Additional Resources

- [React 19 Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [ts-results Documentation](https://github.com/vultix/ts-results)
- [Zod Documentation](https://zod.dev/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 📝 License

MIT © [Athma-Vasi](https://github.com/Athma-Vasi)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

**Built with ❤️ using React, TypeScript, and Vite**
