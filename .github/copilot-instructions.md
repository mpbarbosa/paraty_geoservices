# Copilot Guidance — paraty_geoservices

This file provides durable, high-signal guidance for Copilot-assisted development in this repository. For implementation details and up-to-date reference, consult the authoritative documents listed below.

## Project Purpose

`paraty_geoservices` is a reverse geocoding service library developed in TypeScript and Node.js.

## Source Layout and Architecture

- Shared low-level utilities are in `src/utils/`.
- Maintain clear separation of concerns when adding or modifying modules.

## Design and Implementation Guidance

- Follow standard best practices for modularity and separation of concerns.
- When unsure about architecture, dependencies, or workflow, consult the authoritative documentation below.

## Validation

- Run tests with: `npm test`
- Build the project with: `npm run build`

## Reference Documentation

Consult these documents for authoritative guidance:
- `README.md` — Project overview and usage
- `CHANGELOG.md` — Notable changes
- `CONTRIBUTING.md` — Contribution and dependency rules
- `CLAUDE.md` — Claude-specific codebase guidance

## Build Artifacts

- Main entry point: `dist/index.js`
- Type definitions: `dist/index.d.ts`
- Do not edit files in `dist/`; they are generated output.

## Workflow Surfaces

- Workflow configuration: `.workflow-config.yaml`
- Runtime artifacts and cache: `.ai_workflow/`
