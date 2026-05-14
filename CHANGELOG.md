# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.2/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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

### Changed

- `README.md`, `docs/architecture.md`, `docs/getting-started.md`, and
  `docs/contributing.md` to document the AWS reverse-geocoding adapter.
- `docs/architecture.md`, `docs/getting-started.md`, and
  `docs/contributing.md` to document the built-in mock provider and its role
  in the infrastructure layer.

## [1.2.4] - 2026-05-11

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
