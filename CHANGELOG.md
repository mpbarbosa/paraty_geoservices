# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.2/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.6.3] - 2026-05-17

### Added

- `scripts/verify-package-consumers.mjs` — packs the repository and smoke-tests isolated CommonJS, ESM, and TypeScript consumers against the tarball.

### Changed

- The ESM build now rewrites emitted relative imports with `.js` extensions and writes `dist/esm/package.json` with `"type": "module"` so Node package consumers can load `dist/esm/index.js`.
- `package.json` now includes `prepack` and `verify:package` scripts for package-consumer validation.
- `docs/cicd-roadmap.md`, `docs/contributing.md`, and `ROADMAP.md` now document the shipped package-consumer verification phase.

### CI

- `.github/workflows/ci.yml` and `.github/workflows/release.yml` now run `npm run verify:package` after `npm pack --dry-run` to validate the packed artifact before release.

## [1.6.0] - 2026-05-17

### Added

- `GeoAddress` entity and `ReverseGeocoder` domain port for provider-agnostic reverse geocoding.
- `GeoReverseGeocodeError` with codes for invalid coordinates, network failures, and provider errors.
- `src/domain/ports/ReverseGeocoder.test.ts` — port contract tests via test doubles.
- `MockReverseGeocoder` infrastructure adapter and `test/infrastructure/providers/MockReverseGeocoder.test.ts`.
- `docs/ReverseGeocoder-port-code-quality-assessment.md` — quality assessment for the domain port.
- `NominatimGeocoder` infrastructure adapter, `NominatimAddressMapper`, and `createReverseGeocoderService` factory.
- `docs/ReverseGeocoder-service-code-quality-assessment.md` — quality assessment for the application orchestrator.
- `ObserverSubject` moved to `src/application/ObserverSubject.ts`.

### Changed

- **`ReverseGeocoderService` constructor** — now requires `ReverseGeocoderServiceOptions` with injected `nominatimGeocoder` (and optional `awsGeocoder`). Use `createReverseGeocoderService(fetchManager, config)` for legacy `fetchManager` wiring.
- `ReverseGeocoderService` returns `GeoAddress` from `fetchAddress()`; HTTP and CORS logic moved to `NominatimGeocoder`.
- `AwsGeocoder.reverseGeocode` now rejects with structured `GeoReverseGeocodeError` instances.
- `src/application/index.ts` exports the orchestrator only as `ReverseGeocoderService` (no `ReverseGeocoder` class alias) to avoid clashing with the domain port type.
- `docs/architecture.md` documents `GeoAddress`, `ReverseGeocoder`, `GeoReverseGeocodeError`, and the interface vs. abstract-class port split.

## [1.5.0] - 2026-05-16

### Added

- `GeolocationService` in `src/application/services/GeolocationService.ts` — high-level façade
  combining single-shot and continuous geolocation access with:
  - Leading-edge throttle on watch callbacks (default 5 s, configurable via `setThrottleInterval`)
  - Race-condition guard for `getSingleLocationUpdate` (`hasPendingRequest()`)
  - Automatic low-accuracy retry when a high-accuracy request times out (code 3)
  - `flushThrottle()` escape hatch to bypass the cooldown on demand
- `src/application/services/GeolocationService.test.ts` covering 34 scenarios:
  throttle behaviour, race-condition protection, watch lifecycle, error forwarding,
  `checkPermissions`, and end-to-end provider integration.
- `throttle` utility in `src/utils/throttle.ts` — leading-edge throttle HOF with `flush()`
  escape hatch; migrated from guia_js.
- Public re-exports for `GeolocationService`, `throttle`, and `ThrottledFunction` from
  the package root (`src/index.ts`).
- `docs/architecture.md`: added `src/application/services/` and `src/utils/` sections.
- `src/domain/ports/GeolocationPermissionReader.ts` — permission-state port for
  browser-capable geolocation adapters.
- `createBrowserGeolocationService` in `src/infrastructure/createBrowserGeolocationService.ts`
  and the package root — infrastructure-layer factory for browser-friendly
  `GeolocationService` composition.

- `AwsGeocoder` in `src/infrastructure/providers/AwsGeocoder.ts` for AWS
  Location Service-compatible reverse geocoding with standardized Brazilian
  address output.
- `test/infrastructure/providers/AwsGeocoder.test.ts` covering constructor
  configuration, HTTP requests, normalized address output, error paths, zero
  coordinates, and the package root re-export.
- Public re-exports for `AwsGeocoder` and its result types from the
  infrastructure barrels and the package root.
- `MockGeolocationProvider` in `src/infrastructure/providers/MockGeolocationProvider.ts`
  for deterministic tests and local development.
- `test/infrastructure/providers/MockGeolocationProvider.test.ts` covering
  success paths, error paths, delayed callbacks, watch updates, destruction,
  use-case integration, and the package root re-export.
- Public re-exports for `MockGeolocationProvider` from the infrastructure
  barrels and the package root.
- Public re-exports for `ChangeDetectionCoordinator` and its supporting
  application-layer types from the application barrels and the package root.
- `.github/dependabot.yml` for weekly npm dependency update pull requests.

### Changed

- `package.json` now declares dual CJS/ESM package-root entry points via
  `"main"`, `"module"`, and `"exports"` so npm/bundler consumers can resolve
  `paraty_geoservices` without hard-coding `dist/index.js` or
  `dist/esm/index.js`.
- `README.md`, `docs/architecture.md`, `docs/getting-started.md`, and
  `docs/contributing.md` to document the AWS reverse-geocoding adapter.
- `docs/architecture.md`, `docs/getting-started.md`, and
  `docs/contributing.md` to document the built-in mock provider and its role
  in the infrastructure layer.
- `README.md`, `docs/architecture.md`, `docs/getting-started.md`, and
  `docs/cicd-roadmap.md` to document the package-root
  `ChangeDetectionCoordinator` export and mark the public API hardening roadmap
  step as shipped.
- `GeolocationService` now requires an injected `GeolocationProvider` and
  delegates permission checks through a port-compatible collaborator instead of
  importing `BrowserGeolocationProvider` or reading `navigator` directly.
- `BrowserGeolocationProvider` and `MockGeolocationProvider` now implement
  `checkPermissions()` for permission-aware integrations and tests.
- `npm run test:coverage` now writes reports to `.ai_workflow/coverage`,
  avoiding stale permission issues from an existing root-owned `coverage/`
  directory in local environments.

### CI

- `.github/workflows/ci.yml` now runs `npm run test:coverage` instead of plain
  `npm test` and uploads the generated `.ai_workflow/coverage/` artifact for
  each Node matrix job.
- `jest.config.js` now enforces global coverage thresholds of 97% for lines,
  statements, and functions, plus 91% for branches, based on the current suite
  baseline.
- `docs/cicd-roadmap.md` now marks Phase 2 (Coverage Gates) as shipped.
- `.github/workflows/release.yml` now automates tagged releases by running type
  checking, build, tests, `npm pack --dry-run`, `npm publish`, and GitHub
  Release creation for `v*.*.*` tags.
- `.github/workflows/release.yml` now follows successful tagged releases with a
  `docs` job that regenerates TypeDoc, uploads `docs/api/` as a Pages artifact,
  and deploys the API reference to GitHub Pages.
- `docs/cicd-roadmap.md` now marks Phase 3 (Automated Release Pipeline) as
  shipped and documents the tag-driven release flow.
- `docs/cicd-roadmap.md` now marks Phase 4 (Documentation Publishing) as
  shipped and documents the GitHub Pages deployment flow for `docs/api/`.
- `.github/workflows/ci.yml` now runs `npm audit --audit-level=high` on each CI
  matrix job, and `docs/cicd-roadmap.md` now marks Phase 5 (Dependency and
  Security Auditing) as shipped.

## [1.2.5] - 2026-05-11

### Changed

- `BrowserGeolocationProvider`: added class-level JSDoc and JSDoc for the
  `isPermissionsAPISupported()` and `getNavigator()` public methods.
- `test/infrastructure/providers/BrowserGeolocationProvider.test.ts`: added
  file-level JSDoc comment for consistency with project documentation style.

## [1.0.2] - 2026-05-11

### Added

- Initial release of `paraty_geoservices` TypeScript library.
- `GeolocationProvider` abstract base class for dependency injection.
- `GetCurrentPositionUseCase` and `WatchPositionUseCase` application use cases.
- `BrowserGeolocationProvider` infrastructure adapter for the browser Geolocation API.
- Domain entities: `GeoPosition`, `GeoPositionError`, `GeoPositionOptions`.
- Clean Architecture layering: domain, application, infrastructure.
- Jest test suite with `ts-jest` integration.
- TypeDoc documentation generation.
