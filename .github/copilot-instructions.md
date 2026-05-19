# Copilot Guidance — paraty_geoservices

This file provides durable, high-signal guidance for Copilot-assisted development in this repository.

## Project Purpose

`paraty_geoservices` is a reverse geocoding service library developed in TypeScript and Node.js.

## Architecture

- Shared low-level utilities are in `src/utils/`.

## Validation

- To test: `npm test`
- To build: `npm run build`

## Build Artifacts

- Do not edit files in `dist/`; they are generated output.
- Main package entry points and types are in `dist/index.js`, `dist/esm/index.js`, and `dist/index.d.ts`.

## Workflow Surfaces

- Workflow configuration: `.workflow-config.yaml`
- Runtime artifacts and cache: `.ai_workflow/`

## Reference Documentation

For implementation details, design principles, and contribution rules, consult:
- `README.md`
- `CHANGELOG.md`
- `CONTRIBUTING.md`
- `CLAUDE.md`
- `ROADMAP.md`

When unsure about architecture, dependencies, or workflow, refer to these documents.
