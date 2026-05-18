# Step 01_5 Report

**Step:** Copilot_Instructions_Validation
**Status:** 🤖
**Timestamp:** 5/17/2026, 8:53:03 PM

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
- Package version: `1.5.0`
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
- ### Finding 1 - Project Purpose Statement: Missing `Repo-fact evidence` bullet value.
- ### Finding 2 - Source Layout and Architecture uses unsupported action "keep (condense for clarity)".
- ### Finding 2 - Source Layout and Architecture: Missing `Repo-fact evidence` bullet value.
- ### Finding 3 - Validation Commands uses unsupported action "keep (condense for clarity)".
- ### Finding 3 - Validation Commands: Missing `Repo-fact evidence` bullet value.
- ### Finding 4 - Build Artifacts and Entry Points uses unsupported action "keep (condense for clarity)".
- ### Finding 4 - Build Artifacts and Entry Points: Missing `Repo-fact evidence` bullet value.
- ### Finding 5 - Workflow Surfaces uses unsupported action "keep (condense for clarity)".
- ### Finding 5 - Workflow Surfaces: Missing `Repo-fact evidence` bullet value.
- ### Finding 6 - Reference Documentation Pointers uses unsupported action "rewrite (add `ROADMAP.md`, condense)".
- ### Finding 6 - Reference Documentation Pointers: Missing `Repo-fact evidence` bullet value.
- ### Finding 7 - Overly Broad or Duplicative Content uses unsupported action "condense".
- ### Finding 7 - Overly Broad or Duplicative Content: Missing `Repo-fact evidence` bullet value.
- ### Finding 8 - Absence of Unsupported or Invented Claims uses unsupported action "keep as is".
- ### Finding 8 - Absence of Unsupported or Invented Claims is a meta or absent-topic finding; reserve that pattern for the single no-issue finding or a concretely required omission.
- ### Finding 8 - Absence of Unsupported or Invented Claims: `supported guidance` findings must cite explicit surfaced repo-fact support, not `not available`.

### Findings
Structured findings could not be trusted.

Validation issues:
- ### Finding 1 - Project Purpose Statement: Missing `Repo-fact evidence` bullet value.
- ### Finding 2 - Source Layout and Architecture uses unsupported action "keep (condense for clarity)".
- ### Finding 2 - Source Layout and Architecture: Missing `Repo-fact evidence` bullet value.
- ### Finding 3 - Validation Commands uses unsupported action "keep (condense for clarity)".
- ### Finding 3 - Validation Commands: Missing `Repo-fact evidence` bullet value.
- ### Finding 4 - Build Artifacts and Entry Points uses unsupported action "keep (condense for clarity)".
- ### Finding 4 - Build Artifacts and Entry Points: Missing `Repo-fact evidence` bullet value.
- ### Finding 5 - Workflow Surfaces uses unsupported action "keep (condense for clarity)".
- ### Finding 5 - Workflow Surfaces: Missing `Repo-fact evidence` bullet value.
- ### Finding 6 - Reference Documentation Pointers uses unsupported action "rewrite (add `ROADMAP.md`, condense)".
- ### Finding 6 - Reference Documentation Pointers: Missing `Repo-fact evidence` bullet value.
- ### Finding 7 - Overly Broad or Duplicative Content uses unsupported action "condense".
- ### Finding 7 - Overly Broad or Duplicative Content: Missing `Repo-fact evidence` bullet value.
- ### Finding 8 - Absence of Unsupported or Invented Claims uses unsupported action "keep as is".
- ### Finding 8 - Absence of Unsupported or Invented Claims is a meta or absent-topic finding; reserve that pattern for the single no-issue finding or a concretely required omission.
- ### Finding 8 - Absence of Unsupported or Invented Claims: `supported guidance` findings must cite explicit surfaced repo-fact support, not `not available`.

See the raw AI response below for the untrusted original output.

### AI Response
## Findings

### Finding 1 - Project Purpose Statement
- **Classification**: supported guidance
- **Current file evidence**: 
  > `paraty_geoservices` is a reverse geocoding service library developed in TypeScript and Node.js.
- **Repo-fact evidence**: 
  > Package description: A reverse geocoding service library developed in TypeScript and Node.js.
- **Action**: keep
- **Why this matters**: A concise, accurate project description helps Copilot understand the repository’s domain and context.

---

### Finding 2 - Source Layout and Architecture
- **Classification**: supported guidance
- **Current file evidence**: 
  > - Shared low-level utilities are in `src/utils/`.
  > - Maintain clear separation of concerns when adding or modifying modules.
- **Repo-fact evidence**: 
  > - `src/utils/` - Shared low-level utilities
- **Action**: keep (condense for clarity)
- **Why this matters**: Clear architectural boundaries guide Copilot in placing and refactoring code appropriately.

---

### Finding 3 - Validation Commands
- **Classification**: supported guidance
- **Current file evidence**: 
  > - Run tests with: `npm test`
  > - Build the project with: `npm run build`
- **Repo-fact evidence**: 
  > - Test: `npm test`
  > - Build: `npm run build`
- **Action**: keep (condense for clarity)
- **Why this matters**: Directing Copilot to standard validation commands ensures code changes are properly verified.

---

### Finding 4 - Build Artifacts and Entry Points
- **Classification**: supported guidance
- **Current file evidence**: 
  > - Main entry point: `dist/index.js`
  > - Type definitions: `dist/index.d.ts`
  > - Do not edit files in `dist/`; they are generated output.
- **Repo-fact evidence**: 
  > - Main entry point: `dist/index.js`
  > - Type definitions: `dist/index.d.ts`
  > - `exports . -> types: ./dist/index.d.ts`
  > - `main -> dist/index.js`
- **Action**: keep (condense for clarity)
- **Why this matters**: Prevents Copilot from suggesting edits to generated files and clarifies the public API surface.

---

### Finding 5 - Workflow Surfaces
- **Classification**: supported guidance
- **Current file evidence**: 
  > - Workflow configuration: `.workflow-config.yaml`
  > - Runtime artifacts and cache: `.ai_workflow/`
- **Repo-fact evidence**: 
  > - `.workflow-config.yaml` - Project-local workflow configuration
  > - `.ai_workflow/` - Runtime artifacts, cache, and checkpoints
- **Action**: keep (condense for clarity)
- **Why this matters**: Helps Copilot avoid editing or misusing workflow and runtime artifact files.

---

### Finding 6 - Reference Documentation Pointers
- **Classification**: supported guidance
- **Current file evidence**: 
  > Consult these documents for authoritative guidance:
  > - `README.md` — Project overview and usage
  > - `CHANGELOG.md` — Notable changes
  > - `CONTRIBUTING.md` — Contribution and dependency rules
  > - `CLAUDE.md` — Claude-specific codebase guidance
- **Repo-fact evidence**: 
  > - Authoritative Reference Docs: `CHANGELOG.md`, `CLAUDE.md`, `CONTRIBUTING.md`, `README.md`, `ROADMAP.md`
- **Action**: rewrite (add `ROADMAP.md`, condense)
- **Why this matters**: Ensures Copilot and contributors are directed to the most current, authoritative sources for details.

---

### Finding 7 - Overly Broad or Duplicative Content
- **Classification**: duplicate reference
- **Current file evidence**: 
  > For implementation details and up-to-date reference, consult the authoritative documents listed below.
- **Repo-fact evidence**: 
  > Authoritative Reference Docs: [list]
- **Action**: condense
- **Why this matters**: Reduces noise and keeps the file focused on Copilot-specific guidance.

---

### Finding 8 - Absence of Unsupported or Invented Claims
- **Classification**: supported guidance
- **Current file evidence**: No unsupported or invented claims present.
- **Repo-fact evidence**: not available
- **Action**: keep as is
- **Why this matters**: Ensures the file remains trustworthy and durable.

---

## Corrected File
```markdown
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
```

## Details

No details available

---

Generated by AI Workflow Automation
