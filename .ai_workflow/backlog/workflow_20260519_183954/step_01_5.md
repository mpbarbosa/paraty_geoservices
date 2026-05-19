# Step 01_5 Report

**Step:** Copilot_Instructions_Validation
**Status:** 🤖
**Timestamp:** 5/19/2026, 6:40:19 PM

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
- Package version: `1.6.2`
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
- ### Finding 2 - Architecture and Utilities Guidance: Repo-fact evidence cites unsupported snippet "src/utils/ - Shared low-level utilities".
- ### Finding 5 - Build Artifacts and Entry Points uses unsupported classification "supported guidance (with minor rewrite)".
- ### Finding 5 - Build Artifacts and Entry Points uses unsupported action "rewrite (condense and clarify)".
- ### Finding 5 - Build Artifacts and Entry Points: Missing `Repo-fact evidence` bullet value.
- ### Finding 6 - Workflow Surfaces: Missing `Repo-fact evidence` bullet value.
- ### Finding 7 - Reference Documentation Pointers: Missing `Repo-fact evidence` bullet value.
- ### Finding 8 - Guidance on Uncertainty: `supported guidance` findings must cite at least one surfaced repo-fact heading or quoted snippet.
- ### Finding 9 - Overly Broad or Duplicative Content uses unsupported action "no action needed".
- ### Finding 9 - Overly Broad or Duplicative Content: Repo-fact evidence cites unsupported snippet "Do NOT recreate exhaustive inventories, count summaries, release-status snapshots, or tutorial-style content inside the Copilot instructions file unless the repo facts clearly show they are essential to Copilot guidance.".

### Findings
Structured findings could not be trusted.

Validation issues:
- ### Finding 2 - Architecture and Utilities Guidance: Repo-fact evidence cites unsupported snippet "src/utils/ - Shared low-level utilities".
- ### Finding 5 - Build Artifacts and Entry Points uses unsupported classification "supported guidance (with minor rewrite)".
- ### Finding 5 - Build Artifacts and Entry Points uses unsupported action "rewrite (condense and clarify)".
- ### Finding 5 - Build Artifacts and Entry Points: Missing `Repo-fact evidence` bullet value.
- ### Finding 6 - Workflow Surfaces: Missing `Repo-fact evidence` bullet value.
- ### Finding 7 - Reference Documentation Pointers: Missing `Repo-fact evidence` bullet value.
- ### Finding 8 - Guidance on Uncertainty: `supported guidance` findings must cite at least one surfaced repo-fact heading or quoted snippet.
- ### Finding 9 - Overly Broad or Duplicative Content uses unsupported action "no action needed".
- ### Finding 9 - Overly Broad or Duplicative Content: Repo-fact evidence cites unsupported snippet "Do NOT recreate exhaustive inventories, count summaries, release-status snapshots, or tutorial-style content inside the Copilot instructions file unless the repo facts clearly show they are essential to Copilot guidance.".

See the raw AI response below for the untrusted original output.

### AI Response
## Findings

### Finding 1 - Project Purpose Statement
- **Classification**: supported guidance
- **Current file evidence**: "`paraty_geoservices` is a reverse geocoding service library developed in TypeScript and Node.js." (lines 5–6)
- **Repo-fact evidence**: "Package description: A reverse geocoding service library developed in TypeScript and Node.js."
- **Action**: keep
- **Why this matters**: A concise, accurate project description helps Copilot understand the repository's domain and context.

---

### Finding 2 - Architecture and Utilities Guidance
- **Classification**: supported guidance
- **Current file evidence**: "- Shared low-level utilities are in `src/utils/`." (line 9)
- **Repo-fact evidence**: "src/utils/ - Shared low-level utilities"
- **Action**: keep
- **Why this matters**: Directs Copilot to the correct location for utility code, supporting maintainable contributions.

---

### Finding 3 - Separation of Concerns Principle
- **Classification**: inconclusive
- **Current file evidence**: "- Maintain clear separation of concerns when adding or modifying modules." (line 10)
- **Repo-fact evidence**: not available
- **Action**: omit pending evidence
- **Why this matters**: While good practice, this principle is not explicitly surfaced in the repo facts and should not be presented as a repository-specific rule.

---

### Finding 4 - Validation Commands
- **Classification**: supported guidance
- **Current file evidence**: "- To test: `npm test`" and "- To build: `npm run build`" (lines 13–14)
- **Repo-fact evidence**: "Test: `npm test`", "Build: `npm run build`"
- **Action**: keep
- **Why this matters**: Ensures Copilot suggests the correct commands for validation, reducing errors in automated or manual workflows.

---

### Finding 5 - Build Artifacts and Entry Points
- **Classification**: supported guidance (with minor rewrite)
- **Current file evidence**: 
  - "- Do not edit files in `dist/`; they are generated output."
  - "- Main entry points and types: ... CommonJS: `dist/index.js` ... ESM: `dist/esm/index.js` ... Types: `dist/index.d.ts`" (lines 17–22)
- **Repo-fact evidence**: 
  - "Do not edit files in `dist/`; they are generated output."
  - "exports . -> types: ./dist/index.d.ts, import: ./dist/esm/index.js, require: ./dist/index.js, default: ./dist/index.js"
- **Action**: rewrite (condense and clarify)
- **Why this matters**: Prevents Copilot from suggesting edits to generated files and clarifies the correct entry points for package consumers.

---

### Finding 6 - Workflow Surfaces
- **Classification**: supported guidance
- **Current file evidence**: 
  - "- Workflow configuration: `.workflow-config.yaml`"
  - "- Runtime artifacts and cache: `.ai_workflow/`" (lines 24–25)
- **Repo-fact evidence**: 
  - ".workflow-config.yaml - Project-local workflow configuration"
  - ".ai_workflow/ - Runtime artifacts, cache, and checkpoints"
- **Action**: keep
- **Why this matters**: Guides Copilot to respect workflow and runtime artifact boundaries.

---

### Finding 7 - Reference Documentation Pointers
- **Classification**: supported guidance
- **Current file evidence**: 
  - "For implementation details, design principles, and contribution rules, consult: ... `README.md` ... `CHANGELOG.md` ... `CONTRIBUTING.md` ... `CLAUDE.md` ... `ROADMAP.md`" (lines 27–33)
- **Repo-fact evidence**: 
  - "Authoritative Reference Docs ... `CHANGELOG.md` ... `CLAUDE.md` ... `CONTRIBUTING.md` ... `README.md` ... `ROADMAP.md`"
- **Action**: keep
- **Why this matters**: Directs Copilot to authoritative sources for details, reducing duplication and drift.

---

### Finding 8 - Guidance on Uncertainty
- **Classification**: supported guidance
- **Current file evidence**: "When unsure about architecture, dependencies, or workflow, refer to these documents." (lines 34–35)
- **Repo-fact evidence**: not directly quoted, but implied by the reference doc list
- **Action**: keep
- **Why this matters**: Encourages Copilot to defer to authoritative docs, improving answer quality.

---

### Finding 9 - Overly Broad or Duplicative Content
- **Classification**: duplicate reference
- **Current file evidence**: None found in the current file; no exhaustive inventories, status snapshots, or command lists present.
- **Repo-fact evidence**: "Do NOT recreate exhaustive inventories, count summaries, release-status snapshots, or tutorial-style content inside the Copilot instructions file unless the repo facts clearly show they are essential to Copilot guidance."
- **Action**: no action needed
- **Why this matters**: Confirms the file is already concise and focused.

---

## Corrected File
```markdown
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
```

## Details

No details available

---

Generated by AI Workflow Automation
