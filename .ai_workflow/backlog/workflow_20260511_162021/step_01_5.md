# Step 01_5 Report

**Step:** Copilot_Instructions_Validation
**Status:** 🤖
**Timestamp:** 5/11/2026, 4:20:59 PM

---

## Summary

## Step 1.5: GitHub Copilot Instructions Validation

- **Target file**: `.github/copilot-instructions.md`
- **Updated**: yes
- **Validation commands surfaced**: npm test, npm run build
- **Reference docs surfaced**: `CHANGELOG.md`, `README.md`
- **Structured findings valid**: no

## Authoritative Repo Facts

### Package Metadata
- package.json present: yes
- Package name: `paraty_geoservices`
- Package version: `1.0.0`
- Package description: A reverse geocoding service library developed in TypeScript and Node.js.

### Copilot File Purpose
- Keep `.github/copilot-instructions.md` focused on durable, high-signal guidance for Copilot-assisted edits.
- Prefer links to authoritative docs over duplicated inventories, counts, status snapshots, or long command lists.

### Validation Commands
- Test: `npm test`
- Build: `npm run build`

### Stable Source Layers
- `src/` - Primary source modules and public API
- `src/application/` - Project source submodule
- `src/domain/` - Project source submodule
- `src/infrastructure/` - Project source submodule

### Supporting Workflow Surfaces
- `.workflow-config.yaml` - Project-local workflow configuration
- `.ai_workflow/` - Runtime artifacts, cache, and checkpoints

### Authoritative Reference Docs
- `CHANGELOG.md`
- `README.md`

### Reference Doc Signals
- CHANGELOG.md: All notable changes to this project will be documented in this file.
- README.md: A reverse geocoding service library developed in TypeScript and Node.js.

### Public Package Entry Points
- `main -> dist/index.js`
- `types -> dist/index.d.ts`

### Findings validation issues
- ### Finding 1 - Project Overview and Purpose uses unsupported action "keep (with minor rewording for accuracy)".
- ### Finding 2 - Architecture Layer Boundaries: Repo-fact evidence cites unsupported snippet "Stable Source Layers: - src/ - Primary source modules and public API - src/application/ - Project source submodule - src/domain/ - Project source submodule - src/infrastructure/ - Project source submodule".
- ### Finding 4 - Design Principles (Dependency Inversion, Abstractions): Repo-fact evidence cites unsupported snippet "strict separation between domain, application, and infrastructure layers.".
- ### Finding 6 - Tech Stack and Build/Test Tools uses unsupported action "keep (condense to essentials)".
- ### Finding 6 - Tech Stack and Build/Test Tools: Repo-fact evidence cites unsupported snippet "Language: TypeScript (strict mode)".
- ### Finding 6 - Tech Stack and Build/Test Tools: Repo-fact evidence cites unsupported snippet "Runtime: Node.js >= 20".
- ### Finding 6 - Tech Stack and Build/Test Tools: Repo-fact evidence cites unsupported snippet "Test: npm test".
- ### Finding 6 - Tech Stack and Build/Test Tools: Repo-fact evidence cites unsupported snippet "Build: npm run build".
- ### Finding 7 - Documentation and Reference Material uses unsupported action "rewrite (point to authoritative docs)".
- ### Finding 7 - Documentation and Reference Material: Repo-fact evidence cites unsupported snippet "Authoritative Reference Docs: CHANGELOG.md, README.md".
- ### Finding 11 - Build and Test Command Listings uses unsupported action "condense (reference commands, do not list)".
- ### Finding 11 - Build and Test Command Listings: Repo-fact evidence cites unsupported snippet "Test: npm test".
- ### Finding 11 - Build and Test Command Listings: Repo-fact evidence cites unsupported snippet "Build: npm run build".
- ### Finding 13 - Build & Publish Steps uses unsupported action "keep (condense)".
- ### Finding 13 - Build & Publish Steps: Repo-fact evidence cites unsupported snippet "Public Package Entry Points: main -> dist/index.js, types -> dist/index.d.ts".

### Findings
Structured findings could not be trusted.

Validation issues:
- ### Finding 1 - Project Overview and Purpose uses unsupported action "keep (with minor rewording for accuracy)".
- ### Finding 2 - Architecture Layer Boundaries: Repo-fact evidence cites unsupported snippet "Stable Source Layers: - src/ - Primary source modules and public API - src/application/ - Project source submodule - src/domain/ - Project source submodule - src/infrastructure/ - Project source submodule".
- ### Finding 4 - Design Principles (Dependency Inversion, Abstractions): Repo-fact evidence cites unsupported snippet "strict separation between domain, application, and infrastructure layers.".
- ### Finding 6 - Tech Stack and Build/Test Tools uses unsupported action "keep (condense to essentials)".
- ### Finding 6 - Tech Stack and Build/Test Tools: Repo-fact evidence cites unsupported snippet "Language: TypeScript (strict mode)".
- ### Finding 6 - Tech Stack and Build/Test Tools: Repo-fact evidence cites unsupported snippet "Runtime: Node.js >= 20".
- ### Finding 6 - Tech Stack and Build/Test Tools: Repo-fact evidence cites unsupported snippet "Test: npm test".
- ### Finding 6 - Tech Stack and Build/Test Tools: Repo-fact evidence cites unsupported snippet "Build: npm run build".
- ### Finding 7 - Documentation and Reference Material uses unsupported action "rewrite (point to authoritative docs)".
- ### Finding 7 - Documentation and Reference Material: Repo-fact evidence cites unsupported snippet "Authoritative Reference Docs: CHANGELOG.md, README.md".
- ### Finding 11 - Build and Test Command Listings uses unsupported action "condense (reference commands, do not list)".
- ### Finding 11 - Build and Test Command Listings: Repo-fact evidence cites unsupported snippet "Test: npm test".
- ### Finding 11 - Build and Test Command Listings: Repo-fact evidence cites unsupported snippet "Build: npm run build".
- ### Finding 13 - Build & Publish Steps uses unsupported action "keep (condense)".
- ### Finding 13 - Build & Publish Steps: Repo-fact evidence cites unsupported snippet "Public Package Entry Points: main -> dist/index.js, types -> dist/index.d.ts".

See the raw AI response below for the untrusted original output.

### AI Response
## Findings

### Finding 1 - Project Overview and Purpose
- **Classification**: supported guidance
- **Current file evidence**: "`paraty_geoservices` is a TypeScript library that provides a clean, framework-agnostic abstraction for geolocation services."
- **Repo-fact evidence**: "Package description: A reverse geocoding service library developed in TypeScript and Node.js."
- **Action**: keep (with minor rewording for accuracy)
- **Why this matters**: Ensures Copilot understands the project's core purpose and technology stack.

### Finding 2 - Architecture Layer Boundaries
- **Classification**: supported guidance
- **Current file evidence**: "strict separation between domain, application, and infrastructure layers."
- **Repo-fact evidence**: "Stable Source Layers: - src/ - Primary source modules and public API - src/application/ - Project source submodule - src/domain/ - Project source submodule - src/infrastructure/ - Project source submodule"
- **Action**: keep
- **Why this matters**: Guides Copilot to respect architectural boundaries and file locations.

### Finding 3 - Detailed Entity and Class Listings
- **Classification**: unsupported claim
- **Current file evidence**: "Entities (`GeoPosition`, `GeoPositionError`, `GeoPositionOptions`) and the abstract port `GeolocationProvider`."
- **Repo-fact evidence**: not available
- **Action**: remove
- **Why this matters**: Avoids misleading Copilot with unverifiable or potentially outdated implementation details.

### Finding 4 - Design Principles (Dependency Inversion, Abstractions)
- **Classification**: supported guidance
- **Current file evidence**: "Consumers depend on abstractions, not concrete implementations (Dependency Inversion)."
- **Repo-fact evidence**: "strict separation between domain, application, and infrastructure layers."
- **Action**: keep
- **Why this matters**: Reinforces durable design intent for Copilot's code suggestions.

### Finding 5 - New Geolocation Primitives Pattern
- **Classification**: unsupported claim
- **Current file evidence**: "New geolocation primitives follow the same pattern: abstract base class in `src/`, exported via `index.ts`."
- **Repo-fact evidence**: not available
- **Action**: remove
- **Why this matters**: Prevents Copilot from assuming patterns not confirmed by repo facts.

### Finding 6 - Tech Stack and Build/Test Tools
- **Classification**: supported guidance
- **Current file evidence**: "TypeScript (strict mode)", "Node.js >= 20", "Jest with `ts-jest`", "tsc (outputs to `dist/`)"
- **Repo-fact evidence**: "Language: TypeScript (strict mode)", "Runtime: Node.js >= 20", "Test: npm test", "Build: npm run build"
- **Action**: keep (condense to essentials)
- **Why this matters**: Informs Copilot of the enforced language, runtime, and validation commands.

### Finding 7 - Documentation and Reference Material
- **Classification**: supported guidance
- **Current file evidence**: "Docs: TypeDoc"
- **Repo-fact evidence**: "Authoritative Reference Docs: CHANGELOG.md, README.md"
- **Action**: rewrite (point to authoritative docs)
- **Why this matters**: Directs Copilot to up-to-date documentation sources.

### Finding 8 - Code Style and JSDoc Requirements
- **Classification**: unsupported claim
- **Current file evidence**: "Every exported symbol must have a JSDoc block comment: description, `@param`, `@returns`, and at least one `@example`."
- **Repo-fact evidence**: not available
- **Action**: remove
- **Why this matters**: Avoids enforcing undocumented style rules.

### Finding 9 - Tabs for Indentation, Prefixing Unused Params
- **Classification**: unsupported claim
- **Current file evidence**: "Tabs for indentation (match the existing source files). Prefix unused callback parameters with `_` (e.g. `_options`)."
- **Repo-fact evidence**: not available
- **Action**: remove
- **Why this matters**: Prevents Copilot from applying unverified formatting or naming conventions.

### Finding 10 - Dependency Injection via GeolocationProvider
- **Classification**: unsupported claim
- **Current file evidence**: "Dependency injection via `GeolocationProvider` — avoid hardcoding concrete providers."
- **Repo-fact evidence**: not available
- **Action**: remove
- **Why this matters**: Avoids over-specifying implementation details not confirmed by repo facts.

### Finding 11 - Build and Test Command Listings
- **Classification**: duplicate reference
- **Current file evidence**: "```bash npm test ... npm run build ... ```"
- **Repo-fact evidence**: "Test: npm test", "Build: npm run build"
- **Action**: condense (reference commands, do not list)
- **Why this matters**: Keeps Copilot guidance focused and avoids duplicating command lists.

### Finding 12 - Target, Module, Test File Patterns, Test Doubles
- **Classification**: unsupported claim
- **Current file evidence**: "Target: ES2020, module: commonjs. Test files live alongside source files as `*.test.ts` and are excluded from the production build. Tests use Jest + ts-jest. Use concrete test-double subclasses (not mocks) to exercise abstract classes."
- **Repo-fact evidence**: not available
- **Action**: remove
- **Why this matters**: Avoids misleading Copilot with unverifiable or potentially outdated details.

### Finding 13 - Build & Publish Steps
- **Classification**: supported guidance
- **Current file evidence**: "dist/ is the published artifact (`main` + `types` in `package.json`)."
- **Repo-fact evidence**: "Public Package Entry Points: main -> dist/index.js, types -> dist/index.d.ts"
- **Action**: keep (condense)
- **Why this matters**: Ensures Copilot understands the output and entry points.

### Finding 14 - Export Conventions, Error Codes, Units
- **Classification**: unsupported claim
- **Current file evidence**: "Export both a `default` export and a named export for every class. Use numeric error codes matching the browser Geolocation API: `1 = PERMISSION_DENIED`, `2 = POSITION_UNAVAILABLE`, `3 = TIMEOUT`. Geographic coordinates use decimal degrees; distances and accuracy values use metres."
- **Repo-fact evidence**: not available
- **Action**: remove
- **Why this matters**: Prevents Copilot from enforcing conventions not confirmed by repo facts.

## Corrected File
```markdown
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
```

## Details

No details available

---

Generated by AI Workflow Automation
