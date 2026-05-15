# Copilot Guidance — paraty_geoservices

This file provides durable, high-signal guidance for Copilot-assisted development in this repository. For implementation details and up-to-date reference, see the authoritative docs listed below.

## Project Purpose

`paraty_geoservices` is a reverse geocoding service library developed in TypeScript and Node.js.

## Source Layout

- Shared low-level utilities are in `src/utils/`.
- Maintain clear separation of concerns when adding new modules.

## Design Guidance

- Follow standard software engineering best practices for modularity and separation of concerns.
- When in doubt about architecture or dependencies, consult the authoritative documentation.

## Validation

- Run tests with: `npm test`
- Build the project with: `npm run build`

## Reference Documentation

- For project overview and usage, see `README.md`.
- For notable changes, see `CHANGELOG.md`.

## Build Artifacts

- Main entry point: `dist/index.js`
- Type definitions: `dist/index.d.ts`
- Do not edit files in `dist/`; they are generated output.

## Workflow Surfaces

- Workflow configuration: `.workflow-config.yaml`
- Runtime artifacts and cache: `.ai_workflow/`
