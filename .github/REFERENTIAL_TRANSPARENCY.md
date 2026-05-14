# Referential Transparency Guide

This repository requires referentially transparent changes: keep calculations,
transformations, and decision logic deterministic and free of observable side
effects whenever practical.

## Source of Truth

Use [docs/REFERENTIAL_TRANSPARENCY.md](../docs/REFERENTIAL_TRANSPARENCY.md) as
the authoritative guide. This `.github/` copy exists so workflow reviews and
Copilot-oriented guidance can discover the rule in the expected location
without duplicating the full document.

## Repository-Specific Rules

1. Keep `src/domain/` logic deterministic: domain rules and validators must
   accept explicit inputs and return values with no I/O, time reads, or
   mutation of shared state.
2. Keep `src/application/` use cases thin: delegate calculations to domain
   helpers and delegate side effects to infrastructure interfaces rather than
   mixing both in one function.
3. Keep `src/infrastructure/` adapters as the I/O boundary: transport, caching,
   and persistence concerns must not leak pure decision logic, and pure logic
   must not leak into adapters.
4. Do not call `Date.now()`, `Math.random()`, environment variable reads, or
   network/file operations inside `src/domain/` modules.
5. Pass clocks, random sources, and external configuration as constructor or
   function parameters so behavior is determined by visible inputs.
6. Tests for `src/domain/` and utility modules must not require live services,
   global setup, or real clocks when deterministic inputs would suffice.

## Review Heuristic

If a domain or helper function's output cannot be predicted from its parameters
alone, or if calling it twice with the same inputs can give different results,
the function is not referentially transparent and the source of
non-determinism should be made explicit or moved to a boundary layer.
