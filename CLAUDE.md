# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm test                  # run all tests (ts-jest, node environment)
npm run test:coverage     # tests with coverage report
npm run build             # dual build: CJS → dist/ and ESM → dist/esm/
npm run build:cjs         # CJS only (tsc with tsconfig.json)
npm run build:esm         # ESM only (tsc with tsconfig.esm.json)
npm run docs              # generate TypeDoc documentation
```

Run a single test file:
```bash
npx jest src/application/services/GeolocationService.test.ts
npx jest test/infrastructure/providers/AwsGeocoder.test.ts
```

Run a single test by name:
```bash
npx jest --testNamePattern "throttle"
```

## Architecture

Clean Architecture with a strict inward-only dependency rule:

```
Infrastructure → Application → Domain
```

- **`src/domain/`** — entities (plain TS interfaces: `GeoPosition`, `GeoPositionError`, `GeoPositionOptions`, `GeoAddress`) and ports (`GeolocationProvider` abstract class, `ReverseGeocoder` interface, `GeolocationPermissionReader` interface). No external dependencies.
- **`src/application/`** — use cases and services that depend only on domain ports, never on concrete adapters. Contains `GetCurrentPositionUseCase`, `WatchPositionUseCase`, `GeolocationService`, and `ChangeDetectionCoordinator`.
- **`src/infrastructure/`** — concrete adapters: `BrowserGeolocationProvider` (wraps `navigator.geolocation`), `MockGeolocationProvider` (deterministic in-process, for tests), `AwsGeocoder` (HTTP adapter to an AWS Location Service endpoint), and `createBrowserGeolocationService` (factory that wires `GeolocationService` to `BrowserGeolocationProvider` so application code never instantiates infrastructure directly).
- **`src/utils/`** — pure helpers (`throttle`).

### Key design points

`GeolocationProvider` is an abstract class (not an interface) that all providers must extend. It is the single domain port for position acquisition. New providers go in `src/infrastructure/providers/`, extend this class, implement the four abstract methods, and require no changes to domain or application layers.

`GeolocationService` is the high-level façade: it wraps any `GeolocationProvider` and adds leading-edge throttle (default 5 s, configurable via `setThrottleInterval(ms)`), race-condition protection for single-shot requests, and an automatic low-accuracy retry when a high-accuracy request times out (error code 3).

`BrowserGeolocationProvider` and `MockGeolocationProvider` both implement `GeolocationPermissionReader` alongside the provider port. `GeolocationService` detects this at construction via duck-typing (`isGeolocationPermissionReader`) and auto-wires permission checking without the caller needing to pass a separate `permissionReader`.

`ChangeDetectionCoordinator` depends only on locally-defined application-layer ports (`IObserverSubject`, `IAddressComponentExtractor`, `IAddressState`, `ILogger`) and domain types (`GeoAddress`, `GeoPosition`). Concrete collaborators are injected at wiring time; no CDN imports appear in the application layer. The coordinator emits typed `AddressFieldChangeEvent` objects using English domain names (`StreetChanged`, `NeighborhoodChanged`, `CityChanged`).

### Build configuration

Three tsconfigs serve distinct purposes:
- `tsconfig.json` — CJS output to `dist/`, used by `require()` consumers and Jest.
- `tsconfig.esm.json` — ESM output to `dist/esm/`, `moduleResolution: bundler`, includes the CDN `paths` mapping for `bessa_patterns.ts`.
- `tsconfig.test.json` — extends `tsconfig.json`, adds `jest` and `node` types, includes test files.

### Test layout

Tests live in two places:
- `src/**/*.test.ts` — co-located unit tests alongside source files.
- `test/` — mirrors the `src/` structure; used for integration-style and e2e tests (e.g., `test/e2e/`).

Jest picks up both via `testMatch: ['**/*.test.ts']`.
