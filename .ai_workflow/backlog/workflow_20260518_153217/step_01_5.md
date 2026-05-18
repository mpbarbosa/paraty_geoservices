# Step 01_5 Report

**Step:** Copilot_Instructions_Validation
**Status:** 🤖
**Timestamp:** 5/18/2026, 3:34:43 PM

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
- Package version: `1.6.1`
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
- `exports . -> types: ./dist/index.d.ts, import: ./dist/esm/index.js, require: ./dist/index.js, default: ./dist/index.js`
- `exports ./package.json -> ./package.json`
- `main -> dist/index.js`
- `module -> dist/esm/index.js`
- `types -> dist/index.d.ts`

### Findings validation issues
- ### Finding 2 - Architecture and Source Layout uses unsupported action "keep (condense for clarity)".
- ### Finding 2 - Architecture and Source Layout: Missing `Repo-fact evidence` bullet value.
- ### Finding 3 - Validation Commands uses unsupported action "keep (condense for clarity)".
- ### Finding 3 - Validation Commands: Missing `Repo-fact evidence` bullet value.
- ### Finding 4 - Build Artifacts and Entry Points uses unsupported action "keep (condense for clarity)".
- ### Finding 4 - Build Artifacts and Entry Points: Missing `Repo-fact evidence` bullet value.
- ### Finding 5 - Workflow Surfaces uses unsupported action "keep (condense for clarity)".
- ### Finding 5 - Workflow Surfaces: Missing `Repo-fact evidence` bullet value.
- ### Finding 6 - Reference Documentation Pointers uses unsupported action "keep (condense for clarity)".
- ### Finding 6 - Reference Documentation Pointers: Missing `Repo-fact evidence` bullet value.
- ### Finding 7 - Redundant or Overly Broad Content uses unsupported action "remove or condense".
- ### Finding 7 - Redundant or Overly Broad Content: Missing `Repo-fact evidence` bullet value.

### Findings
Structured findings could not be trusted.

Validation issues:
- ### Finding 2 - Architecture and Source Layout uses unsupported action "keep (condense for clarity)".
- ### Finding 2 - Architecture and Source Layout: Missing `Repo-fact evidence` bullet value.
- ### Finding 3 - Validation Commands uses unsupported action "keep (condense for clarity)".
- ### Finding 3 - Validation Commands: Missing `Repo-fact evidence` bullet value.
- ### Finding 4 - Build Artifacts and Entry Points uses unsupported action "keep (condense for clarity)".
- ### Finding 4 - Build Artifacts and Entry Points: Missing `Repo-fact evidence` bullet value.
- ### Finding 5 - Workflow Surfaces uses unsupported action "keep (condense for clarity)".
- ### Finding 5 - Workflow Surfaces: Missing `Repo-fact evidence` bullet value.
- ### Finding 6 - Reference Documentation Pointers uses unsupported action "keep (condense for clarity)".
- ### Finding 6 - Reference Documentation Pointers: Missing `Repo-fact evidence` bullet value.
- ### Finding 7 - Redundant or Overly Broad Content uses unsupported action "remove or condense".
- ### Finding 7 - Redundant or Overly Broad Content: Missing `Repo-fact evidence` bullet value.

See the raw AI response below for the untrusted original output.

### AI Response
## Findings

### Finding 1 - Project Purpose Statement
- **Classification**: supported guidance
- **Current file evidence**: "`paraty_geoservices` is a reverse geocoding service library developed in TypeScript and Node.js." (lines 5–6)
- **Repo-fact evidence**: "Package description: A reverse geocoding service library developed in TypeScript and Node.js."
- **Action**: keep
- **Why this matters**: A concise, accurate project description helps Copilot understand the repository's intent and context.

---

### Finding 2 - Architecture and Source Layout
- **Classification**: supported guidance
- **Current file evidence**: 
  - "- Shared low-level utilities are in `src/utils/`."
  - "- Maintain clear separation of concerns when adding or modifying modules." (lines 8–10)
- **Repo-fact evidence**: 
  - "src/utils/ - Shared low-level utilities"
- **Action**: keep (condense for clarity)
- **Why this matters**: Clear architectural boundaries guide Copilot in placing and refactoring code appropriately.

---

### Finding 3 - Validation Commands
- **Classification**: supported guidance
- **Current file evidence**: 
  - "- Run tests with: `npm test`"
  - "- Build the project with: `npm run build`" (lines 12–14)
- **Repo-fact evidence**: 
  - "Test: `npm test`"
  - "Build: `npm run build`"
- **Action**: keep (condense for clarity)
- **Why this matters**: Explicit validation commands help Copilot suggest and automate correct test/build steps.

---

### Finding 4 - Build Artifacts and Entry Points
- **Classification**: supported guidance
- **Current file evidence**: 
  - "- CJS entry point: `dist/index.js`"
  - "- ESM entry point: `dist/esm/index.js`"
  - "- Type definitions: `dist/index.d.ts`"
  - "- Do not edit files in `dist/`; they are generated output." (lines 16–20)
- **Repo-fact evidence**: 
  - "exports . -> types: ./dist/index.d.ts, import: ./dist/esm/index.js, require: ./dist/index.js, default: ./dist/index.js"
  - "main -> dist/index.js"
  - "module -> dist/esm/index.js"
  - "types -> dist/index.d.ts"
- **Action**: keep (condense for clarity)
- **Why this matters**: Accurate entry point and artifact guidance prevents Copilot from making changes to generated files or misplacing exports.

---

### Finding 5 - Workflow Surfaces
- **Classification**: supported guidance
- **Current file evidence**: 
  - "- Workflow configuration: `.workflow-config.yaml`"
  - "- Runtime artifacts and cache: `.ai_workflow/`" (lines 22–24)
- **Repo-fact evidence**: 
  - ".workflow-config.yaml - Project-local workflow configuration"
  - ".ai_workflow/ - Runtime artifacts, cache, and checkpoints"
- **Action**: keep (condense for clarity)
- **Why this matters**: Identifying workflow and cache surfaces helps Copilot avoid accidental edits or misplacement of persistent artifacts.

---

### Finding 6 - Reference Documentation Pointers
- **Classification**: supported guidance
- **Current file evidence**: 
  - "- `README.md` — Project overview and usage"
  - "- `CHANGELOG.md` — Notable changes"
  - "- `CONTRIBUTING.md` — Contribution and dependency rules"
  - "- `CLAUDE.md` — Claude-specific codebase guidance"
  - "- `ROADMAP.md` — Project roadmap"
  - "When unsure about architecture, dependencies, or workflow, refer to these documents." (lines 26–34)
- **Repo-fact evidence**: 
  - "Authoritative Reference Docs" section listing these files
- **Action**: keep (condense for clarity)
- **Why this matters**: Directing Copilot to authoritative docs ensures it references up-to-date, canonical project information.

---

### Finding 7 - Redundant or Overly Broad Content
- **Classification**: duplicate reference
- **Current file evidence**: 
  - Repetition of command lists, inventories, and broad reference-manual style content (multiple sections)
- **Repo-fact evidence**: 
  - "Keep `.github/copilot-instructions.md` focused on durable, high-signal guidance for Copilot-assisted edits."
- **Action**: remove or condense
- **Why this matters**: Reducing duplication and verbosity keeps the guidance file focused and maintainable.

---

## Corrected File
```markdown
# Copilot Guidance — paraty_geoservices

This file provides durable, high-signal guidance for Copilot-assisted development in this repository.

## Project Purpose

`paraty_geoservices` is a reverse geocoding service library developed in TypeScript and Node.js.

## Architecture

- Shared low-level utilities are in `src/utils/`.
- Maintain clear separation of concerns when adding or modifying modules.

## Validation

- To test: `npm test`
- To build: `npm run build`

## Build Artifacts

- Do not edit files in `dist/`; they are generated output.
- Main entry points and types:
  - CommonJS: `dist/index.js`
  - ESM: `dist/esm/index.js`
  - Types: `dist/index.d.ts`

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
```

## Details

No details available

---

Generated by AI Workflow Automation
