# paraty_geoservices — Project Guidelines

## Project Overview

`paraty_geoservices` is a TypeScript library that provides a clean, framework-agnostic abstraction for geolocation services. It follows Clean Architecture principles with strict separation between domain, application, and infrastructure layers.

## Architecture

- **`src/`** holds all source and test files; `dist/` is the compiled output (never edit it).
- **Domain layer** (`src/domain/`): Entities (`GeoPosition`, `GeoPositionError`, `GeoPositionOptions`) and the abstract port `GeolocationProvider`.
- **Application layer** (`src/application/`): Use cases (`GetCurrentPositionUseCase`, `WatchPositionUseCase`) and DTOs.
- **Infrastructure layer** (`src/infrastructure/`): Concrete adapters such as `BrowserGeolocationProvider`.
- Consumers depend on abstractions, not concrete implementations (Dependency Inversion).
- New geolocation primitives follow the same pattern: abstract base class in `src/`, exported via `index.ts`.

## Tech Stack

- **Language**: TypeScript (strict mode)
- **Runtime**: Node.js >= 20
- **Test framework**: Jest with `ts-jest`
- **Build**: `tsc` (outputs to `dist/`)
- **Docs**: TypeDoc

## Code Style

- `"strict": true` is enforced; avoid `any`, use proper narrowing.
- Use `export type` for type-only exports to keep the compiled output lean.
- Every exported symbol must have a JSDoc block comment: description, `@param`, `@returns`, and at least one `@example`.
- Tabs for indentation (match the existing source files).
- Prefix unused callback parameters with `_` (e.g. `_options`).
- Dependency injection via `GeolocationProvider` — avoid hardcoding concrete providers.

## Build and Test

```bash
npm test               # run unit tests with Jest
npm run test:coverage  # run tests with coverage report
npm run build          # compile TypeScript → dist/
```

- Target: **ES2020**, module: **commonjs**.
- Test files live alongside source files as `*.test.ts` and are excluded from the production build.
- Tests use **Jest + ts-jest**. Use concrete test-double subclasses (not mocks) to exercise abstract classes.

## Build & Publish

1. `npm run build` compiles TypeScript to `dist/`.
2. `dist/` is the published artifact (`main` + `types` in `package.json`).

## Conventions

- Export both a `default` export and a named export for every class.
- Use numeric error codes matching the browser Geolocation API: `1 = PERMISSION_DENIED`, `2 = POSITION_UNAVAILABLE`, `3 = TIMEOUT`.
- Geographic coordinates use **decimal degrees**; distances and accuracy values use **metres**.
