# GitHub Copilot Instructions — paraty_geoservices

## Project Overview

`paraty_geoservices` is a TypeScript library that provides a clean, framework-agnostic abstraction for geolocation services. It follows Clean Architecture principles with strict separation between domain, application, and infrastructure layers.

## Architecture

- **Domain layer** (`src/domain/`): Entities (`GeoPosition`, `GeoPositionError`, `GeoPositionOptions`) and the abstract port `GeolocationProvider`.
- **Application layer** (`src/application/`): Use cases (`GetCurrentPositionUseCase`, `WatchPositionUseCase`) and DTOs.
- **Infrastructure layer** (`src/infrastructure/`): Concrete adapters such as `BrowserGeolocationProvider`.

## Tech Stack

- **Language**: TypeScript (strict mode)
- **Runtime**: Node.js >= 20
- **Test framework**: Jest with `ts-jest`
- **Build**: `tsc` (outputs to `dist/`)
- **Docs**: TypeDoc

## Coding Conventions

- All source files live under `src/`; tests are colocated as `*.test.ts`.
- Use `export type` for type-only exports to keep the compiled output lean.
- Every public class/interface must have a JSDoc comment.
- No `any`; prefer `unknown` when the type is genuinely unknown.
- Dependency injection is done through the `GeolocationProvider` abstract class — avoid hardcoding concrete providers.

## Testing

Run tests with `npm test`. Coverage is collected from `src/**/*.ts` (excluding test files).

## Build & Publish

1. `npm run build` compiles TypeScript to `dist/`.
2. `dist/` is the published artifact (`main` + `types` in `package.json`).
