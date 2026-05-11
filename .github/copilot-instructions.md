# Copilot Guidance — paraty_geoservices

This file provides durable, high-signal guidance for Copilot-assisted development in this repository. For implementation details and up-to-date reference, see the authoritative docs listed below.

## Project Purpose

`paraty_geoservices` is a reverse geocoding service library developed in TypeScript and Node.js.

## Architecture

- The codebase is organized into stable source layers:
  - `src/domain/`
  - `src/application/`
  - `src/infrastructure/`
- Maintain strict separation between these layers. Place new modules in the appropriate subdirectory.

## Validation

- Run tests with: `npm test`
- Build the project with: `npm run build`

## Reference Documentation

- For project overview and usage, see `README.md`.
- For notable changes, see `CHANGELOG.md`.

## Build Artifacts

- Package entry points:
  - Main: `dist/index.js`
  - Types: `dist/index.d.ts`
- Do not edit files in `dist/`; it is generated output.

## Workflow Surfaces

- Workflow configuration: `.workflow-config.yaml`
- Runtime artifacts and cache: `.ai_workflow/`
