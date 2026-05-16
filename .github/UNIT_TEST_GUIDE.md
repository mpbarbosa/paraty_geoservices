# Unit Test Guide

This repository requires focused, deterministic unit tests: each unit test
should verify one narrow behavior with explicit inputs and isolated effects.

## Source of Truth

Use [docs/UNIT_TEST_GUIDE.md](../docs/UNIT_TEST_GUIDE.md) as the authoritative
guide. This `.github/` copy exists so workflow reviews and Copilot-oriented
guidance can discover the rule in the expected location without duplicating the
full document.

## Repository-Specific Rules

1. Keep `src/domain/` and DTO tests as plain data tests: prefer direct
   input/output assertions with no live browser APIs, HTTP calls, clocks, or
   environment dependencies.
2. Keep `src/application/` service and use-case tests isolated: inject
   collaborators explicitly and prefer `MockGeolocationProvider` or small
   purpose-built stubs over real geolocation behavior.
3. Keep `src/infrastructure/` adapter tests at the boundary: stub `fetch`,
   browser-facing APIs, and mapped CDN imports so infrastructure tests do not
   become integration tests accidentally.
4. Use fake timers for throttling, delayed callbacks, and request lifecycle
   behavior instead of relying on wall-clock delays or sleeps.
5. Restore mutated global and process state such as `globalThis.fetch` and
   `process.env` after each test so test order does not affect results.
6. Keep workflow-wide or browser-driven scenarios in `test/e2e/` and out of the
   default Jest unit suite.

## Review Heuristic

If a test needs live I/O, real elapsed time, or broad fixture setup to pass, it
is probably too wide for a unit test and should be narrowed or moved to an
integration or end-to-end layer.
