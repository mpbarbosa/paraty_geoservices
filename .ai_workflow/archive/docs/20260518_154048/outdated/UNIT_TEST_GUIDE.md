# Unit Test Guide

**Document version:** `1.0.0`

Unit testing is a core quality rule for `paraty_geoservices`.

This repository already has a clear testing shape:

- `src/**/*.test.ts` for co-located unit tests near the implementation
- `test/**/*.test.ts` for mirrored package, adapter, and integration-oriented tests
- `test/e2e/` for end-to-end coverage that is intentionally excluded from the
  default Jest run

This guide explains how to keep unit tests fast, deterministic, and aligned
with the library's Clean Architecture as the codebase grows.

## Goal

Create tests that verify one focused behavior at a time, run quickly in local
development, and make refactoring safer without depending on live runtime
services.

## What Unit Testing Means Here

In `paraty_geoservices`, a unit test usually targets one of these:

1. a domain entity contract or value-shape invariant
2. an application use case or service with collaborators controlled by the test
3. an infrastructure helper or adapter boundary with external effects stubbed
4. a package export contract for the public barrel in `src/index.ts`

The exact file location may vary, but the test boundary should stay narrow:

- the test owns all required setup
- the unit under test receives explicit inputs
- browser, network, clock, and environment effects are controlled
- assertions describe the public contract, not incidental implementation detail

## Why It Matters

1. It catches regressions close to the logic that changed.
2. It keeps Clean Architecture boundaries enforceable through executable checks.
3. It makes provider and service refactors safer.
4. It documents edge cases in geolocation, throttling, and reverse geocoding.
5. It keeps feedback fast enough for frequent local runs with `npm test`.

## Unit Testing and Code LLMs

Unit testing also improves the quality of LLM-assisted coding in this
repository.

The library mixes pure domain shapes, application orchestration, and
infrastructure adapters. Small, deterministic tests make those boundaries easy
to infer from local context. That reduces the risk of an automated edit leaking
browser logic into the application layer, or network concerns into code that
should stay isolated.

### Why LLMs Benefit

- Focused tests reveal the intended contract of a service, provider, or helper
  quickly.
- Deterministic fixtures make geolocation behavior easier to reason about.
- Clear boundary tests show which collaborators are injected and which effects
  must stay isolated.
- Fast feedback makes it easier to confirm whether an edit preserved behavior.
- Well-named tests reduce ambiguity around edge cases and failure modes.

### Where Weak Unit Tests Hurt LLMs

- Broad tests can hide whether the regression is in the domain,
  application, or infrastructure layer.
- Live browser or network effects blur the intended unit boundary.
- Weak fixture control makes timing-sensitive behavior flaky.
- Assertions against internals can block safe refactors of services and
  adapters.
- Missing edge-case tests leave error contracts ambiguous.

## Project Test Tooling

The default unit-test tooling for this repository is:

- Jest with `ts-jest`
- Node test environment
- `testMatch: ['**/*.test.ts']`
- `test/e2e/` excluded from the default suite
- CDN-backed dependencies mapped to local test doubles through
  `moduleNameMapper`

Use the existing commands:

```bash
npm test
npx jest src/application/services/GeolocationService.test.ts
npx jest test/infrastructure/providers/AwsGeocoder.test.ts
npx jest --testNamePattern "throttle"
```

## Required Rules

1. A unit test must verify one focused behavior at a time.
2. Tests must be deterministic across repeated runs.
3. External effects must be stubbed, mocked, injected, or otherwise isolated.
4. Assertions must target the public contract of the unit.
5. Test structure must make the layer boundary obvious.
6. Error paths and edge cases must be covered where they affect callers.
7. Time-sensitive behavior must use explicit timer control.
8. New code should follow the repository's existing file-discovery pattern so
   related tests stay easy to find.

## Applying Unit Testing by Layer

| Layer | Typical unit target | Expected test style |
| --- | --- | --- |
| `src/domain/` | entity contracts, value rules, port behavior | direct input/output assertions with plain data |
| `src/application/` | use cases and services | inject provider/test doubles and assert orchestration behavior |
| `src/infrastructure/` | mappers, providers, HTTP adapters | stub browser or network boundaries and assert translation logic |
| `src/index.ts` exports | public entry-point contracts | assert the package barrel re-exports expected symbols |
| `test/e2e/` | full workflow checks | not unit tests; keep them outside the default unit suite |

Keep the dependency direction visible in the tests:

```text
infrastructure  ->  application  ->  domain
```

Unit tests should not weaken that rule by reaching through layers
unnecessarily.

## Preferred Test Locations

This repository already uses two valid unit-test locations:

1. co-located tests beside the implementation, such as
   `src/application/services/GeolocationService.test.ts`
2. mirrored tests under `test/`, such as
   `test/infrastructure/providers/AwsGeocoder.test.ts`

Both patterns are acceptable. The requirement is discoverability: a reader
should be able to find the unit and its focused tests quickly.

## Patterns That Fit This Repository

### 1. Pure contract tests

Use direct assertions for domain entities, DTOs, and mappers when no runtime
effect is involved.

Good fit:

- `test/domain/entities/GeoPosition.test.ts`
- `test/application/dtos/GetCurrentPositionOutput.test.ts`
- `test/infrastructure/providers/AwsAddressMapper.test.ts`

### 2. Provider-backed service tests

When testing application services, inject a deterministic provider instead of
relying on real browser APIs.

Good fit:

- `src/application/services/GeolocationService.test.ts`
- `src/application/use-cases/GetCurrentPositionUseCase.test.ts`
- `src/application/use-cases/WatchPositionUseCase.test.ts`

Prefer `MockGeolocationProvider` when higher-level behavior needs predictable
positions, errors, permission states, or watch updates.

### 3. Boundary adapter tests

Infrastructure adapters may still have unit tests if the live boundary is
stubbed.

Good fit:

- `test/infrastructure/providers/AwsGeocoder.test.ts` with `fetch` stubbed
- `test/infrastructure/providers/BrowserGeolocationProvider.test.ts` with
  browser-facing collaborators controlled by the test
- `test/infrastructure/createBrowserGeolocationService.test.ts` to verify
  wiring without live browser geolocation

### 4. Timing-sensitive tests

Services that throttle or delay behavior must control time explicitly.

Good fit:

- `src/application/services/GeolocationService.test.ts`
- `test/infrastructure/providers/MockGeolocationProvider.test.ts`

Use Jest fake timers when the contract depends on elapsed time, scheduled
callbacks, or throttle windows.

### 5. Public barrel tests

When a symbol is meant to be part of the public package surface, add a focused
export test instead of assuming re-export wiring is correct.

Good fit:

- `test/infrastructure/providers/AwsGeocoder.test.ts`
- `test/infrastructure/providers/MockGeolocationProvider.test.ts`

## Positive Signals

- The test can set up the unit with a few lines of explicit data.
- `MockGeolocationProvider` or a small stub replaces real browser behavior.
- `fetch`, environment variables, or CDN imports are controlled by the test.
- A failing test points to one service, one use case, one mapper, or one
  provider contract.
- Fake timers are used only when the unit's contract depends on time.
- The same test passes regardless of execution order.

## Warning Signs

- A supposed unit test performs live HTTP, real browser geolocation, or other
  uncontrolled I/O.
- The test depends on wall-clock timing instead of fake timers or injected
  collaborators.
- Setup is so broad that the layer boundary is unclear.
- Assertions depend on private implementation choices rather than public
  behavior.
- A test covers throttling, permission checks, provider mapping, and export
  wiring all at once.
- A test belongs in `test/e2e/` but is being forced into the default Jest suite.

## Repository-Specific Guidance

### Use `MockGeolocationProvider` deliberately

`MockGeolocationProvider` exists to make higher-level tests deterministic. Use
it when testing:

1. single-position success and failure paths
2. permission behavior
3. watch lifecycle behavior
4. delayed callbacks
5. manual location updates

Do not replace a small inline stub with `MockGeolocationProvider` when a tiny
purpose-built test double would make the behavior clearer.

### Control time explicitly

`GeolocationService` includes throttling and request-lifecycle behavior. Tests
for those paths should use fake timers and explicit timer advancement. Do not
sleep in tests or rely on real elapsed time.

### Isolate environment and global state

Infrastructure tests may need to control:

- `globalThis.fetch`
- `process.env`
- mapped CDN imports from `test/__mocks__/`

When a test mutates global or process state, restore it in `afterEach` so other
tests remain isolated.

### Keep end-to-end checks separate

`test/e2e/ChangeDetectionCoordinator.e2e.test.ts` is intentionally outside the
default unit suite. Do not treat browser-driven or workflow-wide validation as a
unit test. Keep those concerns separated so `npm test` stays fast and stable.

## Review Heuristics

### Isolation Test

Would this test still pass if the network were offline, the browser APIs were
unavailable, or the tests ran in a different order?

If not, the boundary is probably too wide for a unit test.

### Dependency Test

Can a reader identify every collaborator from the test setup alone?

If hidden globals or ambient runtime state matter silently, the test is not
describing the real contract clearly enough.

### Behavior Test

Would the test still pass after a safe refactor that preserved the public
contract?

If not, the assertions are probably too coupled to internals.

### Layer Test

Is the test proving domain logic, application orchestration, or infrastructure
translation?

If the answer is "all of them," the scope is too broad.

### Speed Test

Is this small enough to belong in the default Jest suite run by `npm test`?

If not, it may belong in a slower integration or end-to-end workflow instead.

## Preferred Fixes

1. Replace live collaborators with injected stubs, mocks, or
   `MockGeolocationProvider`.
2. Use fake timers for throttle and delayed-callback behavior.
3. Restore mutated globals and environment variables after each test.
4. Split broad tests into smaller behavior-focused cases.
5. Move workflow-wide scenarios into integration or end-to-end coverage instead
   of weakening the definition of unit testing.
6. Keep related architectural guidance in
   [REFERENTIAL_TRANSPARENCY.md](./REFERENTIAL_TRANSPARENCY.md),
   [HIGH_COHESION_GUIDE.md](./HIGH_COHESION_GUIDE.md), and
   [LOW_COUPLING_GUIDE.md](./LOW_COUPLING_GUIDE.md) rather than duplicating it
   here.

## Summary Checklist

- [ ] Each test verifies one focused behavior.
- [ ] The unit boundary is obvious from the setup.
- [ ] Browser, network, clock, and environment effects are controlled.
- [ ] Assertions target the public contract more than internals.
- [ ] Error paths and boundary cases are covered where they matter.
- [ ] Timing-sensitive behavior uses explicit timer control.
- [ ] Tests are discoverable beside the source or under the mirrored `test/`
      structure.
- [ ] End-to-end concerns are kept out of the default unit suite.

## See Also

- [CODE_QUALITY_CONTROL_GUIDE.md](./CODE_QUALITY_CONTROL_GUIDE.md)
- [REFERENTIAL_TRANSPARENCY.md](./REFERENTIAL_TRANSPARENCY.md)
- [HIGH_COHESION_GUIDE.md](./HIGH_COHESION_GUIDE.md)
- [LOW_COUPLING_GUIDE.md](./LOW_COUPLING_GUIDE.md)
- [architecture.md](./architecture.md)
- [contributing.md](./contributing.md)
