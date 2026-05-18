# Low Coupling Guide

**Document version:** `1.0.0`

Low coupling is a core design rule for `paraty_geoservices`.

This repository already separates concerns across stable layers:

- `src/domain/` for business rules, value objects, and invariants
- `src/application/` for use-case orchestration
- `src/infrastructure/` for external I/O: HTTP clients, caches, and geolocation providers

This guide explains how to keep dependencies explicit, narrow, and correctly
directed as the library grows.

## Goal

Modules, classes, and functions should depend on as few other components, layers,
global states, and implicit conventions as practical. Dependencies should be
explicit, stable, and routed through clear boundaries.

## What Low Coupling Means

A loosely coupled component depends on collaborators through narrow, well-defined
contracts:

- "This use case depends on a `GeolocationProvider` interface, not a browser API."
- "This domain function accepts a coordinate and returns an address — no I/O."
- "This adapter hides Nominatim HTTP details behind a shared repository interface."

When a component needs deep knowledge of several unrelated modules, coupling is
probably too high.

## Why It Matters

1. It makes components easier to replace or extend independently.
2. It reduces the blast radius of a change to one module.
3. It makes testing simpler because dependencies can be stubbed or mocked.
4. It keeps the architecture comprehensible at any scale.
5. It prevents accidental knowledge transfer between layers.

## Low Coupling and Code LLMs

Low coupling also improves the quality of LLM-assisted coding.

Code-focused models work best when the dependency surface of a file is small and
visible from local context. In this repository, that means a model can quickly
identify which layer a change targets and whether it is wiring, orchestration, or
a domain rule — without tracing imports through many files.

This does not replace normal engineering discipline. It means low coupling is
useful twice: it helps humans reason about the system, and it helps code models
operate on the system more safely.

### Why LLMs Benefit

- Narrow interfaces make the dependency surface visible at a glance.
- Explicit injection reduces hidden side effects across files.
- Clear layer boundaries prevent incorrect cross-layer edits.
- Focused dependencies make stubbing straightforward in test generation.
- Single-direction dependency flow makes refactoring suggestions safer.

### Where High Coupling Hurts LLMs

- Deep cross-layer imports obscure the real purpose of a change.
- Shared mutable state spreads side effects across many files.
- Large config objects hide which fields are actually required.
- Implicit globals make it difficult to reason about a component in isolation.
- A change in one adapter forces coordinated edits in multiple unrelated modules.

## Architecture Dependency Direction

Dependencies must flow inward. Keep this direction enforced at all times:

```
infrastructure  →  application  →  domain
```

- `domain` has no external dependencies.
- `application` depends on domain types and infrastructure **interfaces** only.
- `infrastructure` implements those interfaces and knows about external I/O.

Cross-layer imports that violate this direction (e.g. domain importing from
infrastructure) are a coupling defect, not a convention question.

## Required Rules

1. Depend on the narrowest stable abstraction available.
2. Keep dependency direction aligned with the architecture above.
3. Avoid hidden coupling through globals, mutable shared state, or implicit
   environment conventions.
4. Entry points may compose multiple modules, but reusable modules must not reach
   across unrelated layers.
5. Prefer dependency injection, constructor parameters, or factory functions over
   singleton lookups and hardwired construction.
6. Centralise truly shared configuration instead of hardcoding repeated values
   across files.
7. Tests must not require broad fixture setup when only one focused dependency is
   needed.

## Positive Signals

- Dependencies are injected or imported for a clear reason.
- Public interfaces are small and stable.
- Call chains are easy to trace.
- A change in one module rarely forces edits in distant modules.
- Shared configuration has a single source of truth.

## Warning Signs

- Modules import across layers for convenience.
- Classes instantiate their own HTTP clients or browser APIs deep inside domain
  logic.
- Helpers know too much about callers, storage, transport, and presentation.
- Shared mutable state coordinates unrelated components.
- Hardcoded values appear in many files and must change together.
- A function accepts a large config object but uses only a few fields.

## Applying Low Coupling in This Repository

| Component type | Low-coupling responsibility in this project |
| --- | --- |
| `src/domain/` module | No external imports; accepts plain values and returns results |
| `src/application/` use case | Depends on domain types and infrastructure interfaces injected at construction |
| `src/infrastructure/` adapter | Implements one shared interface; hides all external I/O details from callers |
| Utility or helper module | Pure function with explicit inputs; no globals or side effects |
| Test file | Stubs or mocks only the single dependency under test |
| Entry point (`src/index.ts`) | Composes modules; no logic; the only place that wires concrete implementations |

Keep new code in the narrowest layer that matches its real job, and inject
dependencies at the layer boundary closest to the system entry point.

## Best Practices

### When Creating a New File

1. Identify the single abstraction the file depends on before writing any imports.
2. Keep `src/domain/` files free of any import from `src/infrastructure/`.
3. Define interfaces in `src/application/` for collaborators provided by
   `src/infrastructure/`.
4. Place concrete wiring in entry points, not inside reusable modules.
5. Prefer constructor injection or explicit factory parameters over module-level
   singletons.

### When Creating Functions or Classes

1. Accept the narrowest type that satisfies the function's need.
2. Declare dependencies as constructor parameters or function arguments.
3. Avoid reaching for globals, process environment variables, or module-level
   caches inside domain logic.
4. Keep the public API small; expose only what callers genuinely need.
5. Prefer boundaries that let both humans and tools understand the dependency
   surface from nearby context.

### When Writing Tests

1. Stub only the one dependency the test exercises.
2. Do not share global fixture state between unrelated test suites.
3. Construct the component under test with its dependencies injected — never rely
   on module-level side effects.
4. Prefer focused unit tests over broad integration tests for domain and
   application logic.

## Reducing Coupling

When a component accrues too many dependencies, reduce coupling around
the narrowest abstraction needed.

1. List every import and collaborator the component currently uses.
2. Identify which are needed for the core responsibility and which are incidental.
3. Extract incidental dependencies behind interfaces or move wiring to an entry
   point.
4. Replace concrete types with narrower interfaces wherever the caller only needs
   a subset of the collaborator's behaviour.
5. Remove global or shared state that exists only to coordinate this component
   with unrelated ones.
6. Re-check that each remaining dependency is explicit, stable, and justified.

## Review Heuristics

### Dependency Trace Test

Can you follow what the component depends on without jumping through many files
or implicit globals?

### Change-Radius Test

If one collaborator changes, do many unrelated modules need coordinated edits?
If yes, coupling is probably too high.

This matters even more in LLM-assisted work: a narrow change radius makes
automated or semi-automated refactoring safer.

### Replacement Test

Could you swap a dependency for a mock, stub, or alternate implementation without
rewriting the caller?

### Construction Test

Does core logic construct its own collaborators, or is wiring kept near the
system boundary?

## Preferred Fixes

1. Replace concrete dependencies with narrow interfaces and inject them at the
   system entry point.
2. Move construction of infrastructure collaborators out of domain and application
   logic.
3. Extract shared configuration into a single centralised module.
4. Remove cross-layer imports by defining the required interface in the depending
   layer.
5. Split broad helpers that know about storage, transport, and presentation into
   focused, single-purpose modules.

## Summary Checklist

- [ ] The component depends on the narrowest stable abstraction available.
- [ ] Dependencies are explicit instead of hidden in globals or implicit setup.
- [ ] Domain logic does not construct infrastructure collaborators directly.
- [ ] Shared values are centralised instead of hardcoded repeatedly.
- [ ] Dependency direction matches the `infrastructure → application → domain` rule.
- [ ] The component can be tested with focused setup.
- [ ] A reviewer could infer the component's key dependencies from its local context.

## See Also

- [HIGH_COHESION_GUIDE.md](HIGH_COHESION_GUIDE.md)
- [contributing.md](contributing.md)
