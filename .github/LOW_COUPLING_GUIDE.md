# Low Coupling Guide

Low coupling is a core design rule for `paraty_geoservices`.

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

## Review Heuristics

### Dependency Trace Test

Can you follow what the component depends on without jumping through many files
or implicit globals?

### Change-Radius Test

If one collaborator changes, do many unrelated modules need coordinated edits?
If yes, coupling is probably too high.

### Replacement Test

Could you swap a dependency for a mock, stub, or alternate implementation without
rewriting the caller?

### Construction Test

Does core logic construct its own collaborators, or is wiring kept near the
system boundary?

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
- [copilot-instructions.md](copilot-instructions.md)
