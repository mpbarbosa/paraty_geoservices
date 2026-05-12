# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.2/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2026-05-11

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
