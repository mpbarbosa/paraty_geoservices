# Copilot Guidance — paraty_geoservices

This file provides durable, high-signal guidance for Copilot-assisted development in this repository. For implementation details and up-to-date reference, see the authoritative docs listed below.

## Project Purpose

`paraty_geoservices` is a reverse geocoding service library developed in TypeScript and Node.js.

## Architecture

- The codebase is organized into three stable source layers:
  - `src/domain/`
  - `src/application/`
  - `src/infrastructure/`
- Maintain strict separation between these layers. Place new modules in the appropriate subdirectory.

## Design Principles

- Follow dependency inversion: depend on abstractions, not concrete implementations.
- Do not cross architecture boundaries in a way that violates the domain/application/infrastructure separation.

## Validation

- Use `npm test` to run tests.
- Use `npm run build` to build the project.

## Reference Documentation

- See `README.md` for project overview and usage.
- See `CHANGELOG.md` for notable changes.

## Build Artifacts

- The published package entry points are:
  - `main`: `dist/index.js`
  - `types`: `dist/index.d.ts`
- Do not edit files in `dist/`; it is generated output.

## Workflow Surfaces

- Project-local workflow configuration: `.workflow-config.yaml`
- Runtime artifacts and cache: `.ai_workflow/`

Keep this file focused on durable Copilot guidance. For implementation specifics, always refer to the authoritative documentation.
