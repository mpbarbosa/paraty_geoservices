# High Cohesion Guide

This repository requires high-cohesion changes: keep each file, symbol, and
document focused on one clear responsibility.

## Source of Truth

Use [docs/HIGH_COHESION_GUIDE.md](../docs/HIGH_COHESION_GUIDE.md) as the
authoritative guide. This `.github/` copy exists so workflow reviews and
Copilot-oriented guidance can discover the rule in the expected location
without duplicating the full document.

## Repository-Specific Rules

1. Keep `src/domain/` focused on business rules, value objects, and invariants
   for reverse geocoding with no I/O or orchestration concerns.
2. Keep `src/application/` focused on use-case orchestration; it may depend on
   domain and infrastructure interfaces but must not contain infrastructure
   implementation details.
3. Keep `src/infrastructure/` focused on external I/O such as HTTP clients,
   caches, and geolocation provider adapters with no domain logic.
4. Keep each utility or helper module focused on one pure, deterministic
   concern with no process or session orchestration.
5. Keep `src/index.ts` as a pure re-export barrel with no implementation logic.
6. Keep each document focused on one topic and link to related guidance instead
   of copying large sections between files.

## Review Heuristic

If the best one-sentence description of a file or symbol needs repeated "and",
the responsibility is probably too broad and should be split.
