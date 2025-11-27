# React + TypeScript + Vite Template (Safe)

A production-ready React + TypeScript + Vite template that emphasizes
**type-safe error handling** and **defensive programming patterns** for building
robust, resilient web applications.

## 🌟 Key Features

### Type-Safe Error Handling 🛡️

- Leverages `ts-results` for functional error handling with `Result<T, E>` and
  `Option<T>` types
- Eliminates null/undefined bugs and uncaught exceptions
- Comprehensive custom error hierarchy with 20+ specialized error types
  (NetworkError, CacheError, ValidationError, etc.)
- Structured error objects with metadata (stack traces, timestamps, status
  codes)

### Web Workers Architecture 🚀

Three specialized workers for offloading expensive operations:

- **Fetch Worker**: HTTP requests with retry logic, exponential backoff, and
  timeout handling
- **Cache Worker**: Persistent worker in-memory state management
- **Async Worker**: Generic async function execution with configurable timeout
  support
- All workers implement safe error boundaries and structured communication
  patterns

### Robust Utilities 💪

- `retryFetchSafe`: Exponential backoff with jitter for network resilience
- `parseSyncSafe`: Type-safe Zod schema validation with comprehensive error
  handling
- `getCachedItemAsyncSafe`: Safe IndexedDB operations via localforage
- All utilities return `SafeResult<T>` for consistent error propagation

### Modern Tooling ⚡

- **Vite** for lightning-fast HMR and optimized builds
- **React 19** with React Compiler for automatic optimization
- **Zod v4** for runtime type validation and schema-based parsing
- **Vitest** for unit testing with web worker support
- **TypeScript 5.9** with strict configuration

### Developer Experience 🎨

- Comprehensive type definitions and generics
- ESLint configured for React + TypeScript best practices
- Error boundary integration with `react-error-boundary`

## 🎯 Use Cases

Perfect for applications that require:

- High reliability and graceful error recovery
- Heavy client-side operations that benefit from Web Workers
- Type-safe data validation and transformation
- Network resilience with automatic retry mechanisms

## 🏗️ Architecture Highlights

- **Reducer Pattern**: Structured state management with validated dispatches
- **Worker Communication**: Type-safe message passing with `SafeResult` wrappers
- **Schema-Driven Validation**: Zod schemas for compile-time and runtime safety
- **Defensive Programming**: Every async operation wrapped in try-catch with
  typed errors

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## React Compiler

The React Compiler is enabled on this template. See
[this documentation](https://react.dev/learn/react-compiler) for more
information.

Note: This will impact Vite dev & build performances.

## Available Plugins

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react)
  uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in
  [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc)
  uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the
configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,
      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install
[eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x)
and
[eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom)
for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
