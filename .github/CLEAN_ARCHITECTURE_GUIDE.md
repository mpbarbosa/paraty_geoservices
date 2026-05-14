# Clean Architecture Guide

This repository requires Clean Architecture compliance: all source code
dependencies must point inward only, from infrastructure through application to
domain.

## Source of Truth

Use [docs/CLEAN_ARCHITECTURE_GUIDE.md](../docs/CLEAN_ARCHITECTURE_GUIDE.md) as
the authoritative guide. This `.github/` copy exists so workflow reviews and
Copilot-oriented guidance can discover the rule in the expected location without
duplicating the full document.

## Repository-Specific Rules

1. Keep `src/domain/` free of imports from `src/application/` or
   `src/infrastructure/` — domain entities and ports must have zero outward
   dependencies.
2. Keep `src/application/` dependent on domain contracts only; it must not import
   concrete providers or any runtime-specific API.
3. Keep `src/infrastructure/` as the only layer allowed to reference browser APIs,
   `fetch`, environment variables, or third-party SDKs.
4. All providers must extend `GeolocationProvider` from
   `src/domain/ports/GeolocationProvider.ts` — never implement an ad-hoc
   interface.
5. Use cases must receive their provider through constructor injection; they must
   not instantiate concrete adapters internally.
6. Tests must use `MockGeolocationProvider` or inline test doubles — never a real
   browser or network.

## Review Heuristic

If a file in `src/domain/` or `src/application/` imports from
`src/infrastructure/`, or if a use case constructs its own provider, the
Dependency Rule has been violated and the change must be refactored before merging.
