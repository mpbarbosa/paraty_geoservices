# Step 01_5 Report

**Step:** Copilot_Instructions_Validation
**Status:** 🤖
**Timestamp:** 5/16/2026, 8:40:42 PM

---

## Summary

## Step 1.5: GitHub Copilot Instructions Validation

- **Target file**: `.github/copilot-instructions.md`
- **Updated**: yes
- **Validation commands surfaced**: npm test, npm run build
- **Reference docs surfaced**: `CHANGELOG.md`, `CLAUDE.md`, `CONTRIBUTING.md`, `README.md`, `ROADMAP.md`
- **Structured findings valid**: no

## Authoritative Repo Facts

### Package Metadata
- package.json present: yes
- Package name: `paraty_geoservices`
- Package version: `1.4.0`
- Package description: A reverse geocoding service library developed in TypeScript and Node.js.

### Copilot File Purpose
- Keep `.github/copilot-instructions.md` focused on durable, high-signal guidance for Copilot-assisted edits.
- Prefer links to authoritative docs over duplicated inventories, counts, status snapshots, or long command lists.

### Validation Commands
- Test: `npm test`
- Build: `npm run build`

### Stable Source Layers
- `src/utils/` - Shared low-level utilities

### Supporting Workflow Surfaces
- `.workflow-config.yaml` - Project-local workflow configuration
- `.ai_workflow/` - Runtime artifacts, cache, and checkpoints

### Authoritative Reference Docs
- `CHANGELOG.md`
- `CLAUDE.md`
- `CONTRIBUTING.md`
- `README.md`
- `ROADMAP.md`

### Reference Doc Signals
- CHANGELOG.md: All notable changes to this project will be documented in this file.
- CLAUDE.md: This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
- CONTRIBUTING.md: Follow the inward-only dependency rule: Infrastructure → Application → Domain. New providers go in `src/infrastructure/providers/` and must extend `GeolocationProvider`. Domain and application layers must not import from infrastructure.
- README.md: A reverse geocoding service library developed in TypeScript and Node.js.
- ROADMAP.md: **Discovered:** 2026-05-16 **Severity:** High — breaks E2E geolocation tests in Docker when CDN hasn't propagated a new tag yet **Context:** guia_js (`vite.config.js`) includes a `resolveParatyGeoservicesCDN` Vite plugin that intercepts `di

### Public Package Entry Points
- `exports . -> types: ./dist/index.d.ts`
- `exports ./package.json -> ./package.json`
- `main -> dist/index.js`
- `types -> dist/index.d.ts`

### Findings validation issues
- ### Finding 2 - Source Layout and Architecture: Repo-fact evidence cites unsupported snippet "src/utils/ - Shared low-level utilities".
- ### Finding 3 - Separation of Concerns Guidance: Repo-fact evidence cites unsupported snippet "Follow standard best practices for modularity and separation of concerns.".
- ### Finding 6 - Build Artifacts Section: Repo-fact evidence cites unsupported snippet "Do not edit files in `dist/`; they are generated output.".
- ### Finding 8 - Design and Implementation Guidance Section uses unsupported action "condense".
- ### Finding 8 - Design and Implementation Guidance Section: Repo-fact evidence cites unsupported snippet "When unsure about architecture, dependencies, or workflow, consult the authoritative documentation below.".
- ### Finding 9 - Overly Verbose or Duplicative Content uses unsupported action "condense".

### Findings
Structured findings could not be trusted.

Validation issues:
- ### Finding 2 - Source Layout and Architecture: Repo-fact evidence cites unsupported snippet "src/utils/ - Shared low-level utilities".
- ### Finding 3 - Separation of Concerns Guidance: Repo-fact evidence cites unsupported snippet "Follow standard best practices for modularity and separation of concerns.".
- ### Finding 6 - Build Artifacts Section: Repo-fact evidence cites unsupported snippet "Do not edit files in `dist/`; they are generated output.".
- ### Finding 8 - Design and Implementation Guidance Section uses unsupported action "condense".
- ### Finding 8 - Design and Implementation Guidance Section: Repo-fact evidence cites unsupported snippet "When unsure about architecture, dependencies, or workflow, consult the authoritative documentation below.".
- ### Finding 9 - Overly Verbose or Duplicative Content uses unsupported action "condense".

See the raw AI response below for the untrusted original output.

### AI Response
## Findings

### Finding 1 - Project Purpose Statement
- **Classification**: supported guidance
- **Current file evidence**: "`paraty_geoservices` is a reverse geocoding service library developed in TypeScript and Node.js."
- **Repo-fact evidence**: "Package description: A reverse geocoding service library developed in TypeScript and Node.js."
- **Action**: keep
- **Why this matters**: A concise, accurate project description helps Copilot contextualize code and documentation suggestions.

### Finding 2 - Source Layout and Architecture
- **Classification**: supported guidance
- **Current file evidence**: "- Shared low-level utilities are in `src/utils/`."
- **Repo-fact evidence**: "src/utils/ - Shared low-level utilities"
- **Action**: keep
- **Why this matters**: Directs Copilot to the correct location for utility code, improving code navigation and suggestions.

### Finding 3 - Separation of Concerns Guidance
- **Classification**: supported guidance
- **Current file evidence**: "- Maintain clear separation of concerns when adding or modifying modules."
- **Repo-fact evidence**: "Follow standard best practices for modularity and separation of concerns."
- **Action**: keep
- **Why this matters**: Reinforces architectural discipline, which is essential for maintainable Copilot-assisted edits.

### Finding 4 - Validation Commands
- **Classification**: supported guidance
- **Current file evidence**: "- Run tests with: `npm test`" and "- Build the project with: `npm run build`"
- **Repo-fact evidence**: "Test: `npm test`", "Build: `npm run build`"
- **Action**: keep
- **Why this matters**: Ensures Copilot-assisted changes are validated using the correct, supported commands.

### Finding 5 - Reference Documentation List
- **Classification**: supported guidance
- **Current file evidence**: "Consult these documents for authoritative guidance: ... `README.md` ... `CHANGELOG.md` ... `CONTRIBUTING.md` ... `CLAUDE.md`"
- **Repo-fact evidence**: "Authoritative Reference Docs" section listing these files
- **Action**: keep
- **Why this matters**: Directs Copilot and users to the correct sources for detailed, up-to-date project information.

### Finding 6 - Build Artifacts Section
- **Classification**: supported guidance
- **Current file evidence**: "- Main entry point: `dist/index.js` ... - Type definitions: `dist/index.d.ts` ... - Do not edit files in `dist/`; they are generated output."
- **Repo-fact evidence**: "Public Package Entry Points" and "Do not edit files in `dist/`; they are generated output."
- **Action**: keep
- **Why this matters**: Prevents accidental edits to generated files, maintaining build integrity.

### Finding 7 - Workflow Surfaces Section
- **Classification**: supported guidance
- **Current file evidence**: "- Workflow configuration: `.workflow-config.yaml` ... - Runtime artifacts and cache: `.ai_workflow/`"
- **Repo-fact evidence**: "Supporting Workflow Surfaces"
- **Action**: keep
- **Why this matters**: Helps Copilot and contributors understand where workflow and runtime artifacts are managed.

### Finding 8 - Design and Implementation Guidance Section
- **Classification**: duplicate reference
- **Current file evidence**: "- Follow standard best practices for modularity and separation of concerns. - When unsure about architecture, dependencies, or workflow, consult the authoritative documentation below."
- **Repo-fact evidence**: "When unsure about architecture, dependencies, or workflow, consult the authoritative documentation below."
- **Action**: condense
- **Why this matters**: This guidance is already covered by the reference documentation pointer; it can be merged for brevity.

### Finding 9 - Overly Verbose or Duplicative Content
- **Classification**: duplicate reference
- **Current file evidence**: The file includes some repeated or verbose statements (e.g., "For implementation details and up-to-date reference, consult the authoritative documents listed below.")
- **Repo-fact evidence**: "Keep `.github/copilot-instructions.md` focused on durable, high-signal guidance for Copilot-assisted edits."
- **Action**: condense
- **Why this matters**: Reducing verbosity keeps the file focused and durable for Copilot guidance.

## Corrected File
```markdown
# Copilot Guidance — paraty_geoservices

This file provides durable, high-signal guidance for Copilot-assisted development in this repository. For implementation details and up-to-date reference, consult the authoritative documents listed below.

## Project Purpose

`paraty_geoservices` is a reverse geocoding service library developed in TypeScript and Node.js.

## Source Layout and Architecture

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

Consult these documents for authoritative guidance:
- `README.md` — Project overview and usage
- `CHANGELOG.md` — Notable changes
- `CONTRIBUTING.md` — Contribution and dependency rules
- `CLAUDE.md` — Claude-specific codebase guidance

When unsure about architecture, dependencies, or workflow, refer to the above documentation.
```

## Details

No details available

---

Generated by AI Workflow Automation
