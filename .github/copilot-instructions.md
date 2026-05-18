# Copilot Guidance — paraty_geoservices

This file provides durable, high-signal guidance for Copilot-assisted development in this repository.

## Project Purpose

`paraty_geoservices` is a reverse geocoding service library developed in TypeScript and Node.js.

## Architecture and Source Layout

- Shared low-level utilities are in `src/utils/`.
- Maintain clear separation of concerns when adding or modifying modules.

## Validation

- Run tests with: `npm test`
- Build the project with: `npm run build`

## Build Artifacts

- Main entry point: `dist/index.js`
- Type definitions: `dist/index.d.ts`
- Do not edit files in `dist/`; they are generated output.

## Workflow Surfaces

- Workflow configuration: `.workflow-config.yaml`
- Runtime artifacts and cache: `.ai_workflow/`

## Reference Documentation

For implementation details, design principles, and contribution rules, consult:
- `README.md` — Project overview and usage
- `CHANGELOG.md` — Notable changes
- `CONTRIBUTING.md` — Contribution and dependency rules
- `CLAUDE.md` — Claude-specific codebase guidance
- `ROADMAP.md` — Project roadmap

When unsure about architecture, dependencies, or workflow, refer to these documents.
