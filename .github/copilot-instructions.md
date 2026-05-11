# paraty_geoservices — Project Guidelines

## Architecture

- **`src/`** holds all source and test files; `dist/` is the compiled output (never edit it).
- The library is built around abstract provider classes (e.g. `GeolocationProvider`). Consumers depend on abstractions, not concrete implementations (Dependency Inversion).
- New geolocation primitives follow the same pattern: abstract base class in `src/`, exported via `index.ts`.

## Code Style

- **TypeScript strict mode** — `"strict": true` is enforced; avoid `any`, use proper narrowing.
- Tabs for indentation (match the existing source files).
- Every exported symbol must have a JSDoc block comment: description, `@param`, `@returns`, and at least one `@example`.
- Prefix unused callback parameters with `_` (e.g. `_options`).

## Build and Test

```bash
npm test               # run unit tests with Jest
npm run test:coverage  # run tests with coverage report
npm run build          # compile TypeScript → dist/
```

- Target: **ES2020**, module: **commonjs**.
- Test files live alongside source files as `*.test.ts` and are excluded from the production build (`tsconfig.json` `exclude` list).
- Tests use **Jest + ts-jest**. Use concrete test-double subclasses (not mocks) to exercise abstract classes.

## Conventions

- Export both a `default` export and a named export for every class (see `GeolocationProvider.ts`).
- Use numeric error codes matching the browser Geolocation API: `1 = PERMISSION_DENIED`, `2 = POSITION_UNAVAILABLE`, `3 = TIMEOUT`.
- Geographic coordinates use **decimal degrees**; distances and accuracy values use **metres**.
