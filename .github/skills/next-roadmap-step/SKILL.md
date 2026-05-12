---
name: next-roadmap-step
description: >
  Analyze the project's current state and recommend the next highest-value
  development step. Reads CHANGELOG.md for unreleased work, the latest
  ai_workflow.js backlog and summary for skipped or pending items, and the
  source tree to identify gaps. Use when you want a data-driven answer to
  "what should I work on next?" or before starting a new session.
argument-hint: Any area of focus or constraint to consider?
---

# next-roadmap-step

## Overview

This skill synthesizes four evidence sources and produces a single,
actionable recommendation for the next development step.

```text
CHANGELOG.md (Unreleased)
  +
.ai_workflow/summaries/<latest>/workflow_summary.md
  +
.ai_workflow/backlog/<latest>/step_*.md  (skipped / unresolved items)
  +
src/ tree scan (gaps in coverage, missing exports, open TODOs)
  ──►  Ranked recommendation + rationale
```

## Step-by-step execution

### 1. Read unreleased changelog entries

```bash
grep -A 200 '## \[Unreleased\]' CHANGELOG.md | grep -B 200 '## \[' | tail -n +2 | head -n -1
```

Note every item listed under `### Added`, `### Changed`, `### Fixed`,
`### Removed`. These represent in-flight work that may need follow-up
(tests, docs, exports).

### 2. Locate the latest workflow run

```bash
ls -1 .ai_workflow/summaries/ | sort | tail -1
```

Assign to `<RUN_ID>`.

If `.ai_workflow/summaries/` is empty or absent, skip to step 5.

### 3. Read the workflow summary

Read `.ai_workflow/summaries/<RUN_ID>/workflow_summary.md`.

Extract:
- **Success rate** (look for `**Success Rate:**`)
- **Skipped steps** (look for `⏭️` lines in the Execution Timeline)
- **Recommendations** section (performance bottlenecks, optimization hints)

### 4. Scan skipped backlog steps

For each step listed as skipped (`⏭️`) in the summary:

```bash
cat .ai_workflow/backlog/<RUN_ID>/step_<N>.md
```

Collect the step name, its summary (if any), and the reason it was skipped.
Skipped steps are candidates for the next action if they address gaps.

### 5. Scan the source tree for gaps

Run the following checks in order — stop after the first check that
produces findings; those findings are your primary signal.

**a. Failing or missing tests**

```bash
npm test -- --passWithNoTests 2>&1 | tail -30
```

Any failing tests are the highest-priority next step.

**b. Open TODOs and FIXMEs in source**

```bash
grep -rn "TODO\|FIXME\|HACK\|XXX" src/ --include="*.ts" | grep -v node_modules
```

**c. Unreleased CHANGELOG items without corresponding tests**

For each `### Added` item in step 1, check that a matching test file
exists under `test/` or alongside the source file.

**d. Build health**

```bash
npm run build 2>&1 | tail -20
```

Any build errors are blocking and override all other findings.

### 6. Synthesize and rank

Score each candidate finding:

| Priority | Condition |
|----------|-----------|
| 🔴 P0 — Blocking | Build failure or test failure |
| 🟠 P1 — High | MEDIUM-severity open issue from workflow review (error handling, async patterns) |
| 🟡 P2 — Medium | Skipped workflow step that addresses a known gap |
| 🟢 P3 — Low | Minor improvement or info-level suggestion |

### 7. Produce the recommendation

Output exactly one recommendation in this format:

```
## Next Roadmap Step

**Recommendation:** <one-sentence action>

**Priority:** <P0 / P1 / P2 / P3> — <label>

**Rationale:**
<2–4 sentences explaining why this is the top priority, citing the
evidence source (CHANGELOG, workflow step, test output, TODO scan)>

**Acceptance criteria:**
- <criterion 1>
- <criterion 2>
- ...

**Suggested starting point:**
<file path or command to begin>
```

If the user supplied a focus area (via the argument), filter candidates
to that area before ranking.

## Example output

```
## Next Roadmap Step

**Recommendation:** Add structured error normalization to
`GetCurrentPositionUseCase.execute()`.

**Priority:** P1 — High

**Rationale:**
The Async Performance Review (step_20, workflow_20260512_012029) flagged a
MEDIUM-severity error-handling gap: provider errors are passed directly to
`reject` without normalization or a consistent error type. The CHANGELOG
lists `MockGeolocationProvider` as unreleased, meaning the use-case layer
is actively being exercised and error paths are visible to new consumers.
Fixing this before the next release prevents API breakage downstream.

**Acceptance criteria:**
- `GetCurrentPositionUseCase.execute()` wraps provider errors in a typed
  domain error (e.g., `GeoPositionError`) before rejecting.
- Existing tests still pass; at least one new test covers the error path.
- CHANGELOG `[Unreleased]` section updated with a `### Changed` entry.

**Suggested starting point:**
src/application/use-cases/GetCurrentPositionUseCase.ts:30
```

## Notes

- Never recommend a step already listed as `✅` in the latest backlog.
- If all checks pass and no skipped steps apply, recommend the next
  unreleased CHANGELOG item that lacks test coverage.
- If all evidence sources are clean, output: `All tracked items are
  resolved. Consider reviewing the project roadmap for new features.`
