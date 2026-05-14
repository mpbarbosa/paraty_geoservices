# Low Coupling Guide

This repository requires low-coupling changes: each module, class, and function
should depend on as few other components as practical through narrow, explicit
contracts.

## Source of Truth

Use [docs/LOW_COUPLING_GUIDE.md](../docs/LOW_COUPLING_GUIDE.md) as the
authoritative guide. This `.github/` copy exists so workflow reviews and
Copilot-oriented guidance can discover the rule in the expected location
without duplicating the full document.

## Repository-Specific Rules

1. Keep `src/domain/` free of external dependencies; it must not import from
   `src/infrastructure/` or any external I/O module.
2. Keep `src/application/` depending only on domain types and infrastructure
   **interfaces**, never on concrete infrastructure implementations.
3. Keep `src/infrastructure/` adapters hidden behind shared interfaces so callers
   in `src/application/` can swap implementations without rewriting.
4. Inject collaborators through constructor parameters, factory functions, or
   explicit imports rather than singleton lookups or hardwired construction.
5. Centralise shared configuration in one place instead of hardcoding repeated
   values across files.
6. Tests must not require broad fixture setup when only one focused dependency
   is needed.

## Review Heuristic

If swapping a dependency for a mock requires editing the caller, or if changing
one module forces edits in several distant modules, coupling is probably too high
and the dependency direction should be reviewed against the
`infrastructure → application → domain` rule.
