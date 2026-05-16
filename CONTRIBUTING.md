# Contributing to paraty_geoservices

## Architecture

Follow the inward-only dependency rule: Infrastructure → Application → Domain. New providers go in `src/infrastructure/providers/` and must extend `GeolocationProvider`. Domain and application layers must not import from infrastructure.

See `docs/CLEAN_ARCHITECTURE_GUIDE.md`, `docs/HIGH_COHESION_GUIDE.md`, and `docs/LOW_COUPLING_GUIDE.md` for detailed guidance.

## Development setup

```bash
npm ci
npm test
npm run build
npm audit --audit-level=high
```

## Code standards

- **Language:** TypeScript strict mode. No `any` without explicit justification.
- **Formatting:** no standalone lint script is currently defined; keep changes consistent with the existing code style and rely on the repository validation commands before committing.
- **No magic numbers:** use named constants for timeouts, intervals, and error codes.
- **No globals:** do not write to `globalThis`, `window`, or `process.env`.
- **Error names:** set `err.name` on custom errors to distinguish them from generic `Error`.
- **JSDoc:** required on all exported classes, interfaces, and public methods.

## Testing

Tests live in two places:

- `src/**/*.test.ts` — co-located unit tests (preferred for new code).
- `test/` — integration and e2e tests.

Follow `docs/UNIT_TEST_GUIDE.md`. Key rules:

- Each test covers one behaviour; name it as a sentence (`it('returns cached position within throttle window')`).
- No shared mutable state between tests; use `beforeEach` to reset fixtures.
- Prefer `MockGeolocationProvider` over manual mocks for provider tests.
- All error paths and retry branches must have a corresponding test.

Run a single file: `npx jest path/to/file.test.ts`

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(geolocation): add permission-aware service
fix(service): clear pending state on fallback rejection
chore: update dependencies
docs: add JSDoc for WatchPositionUseCase
```

Commits must be atomic — one logical change per commit. Do not bundle unrelated changes.

## Pull requests

- Title follows the same Conventional Commits format (≤ 70 characters).
- Body describes *why* the change is needed, not just what changed.
- All CI checks must pass before merging.
- At least one review approval required.

## Barrel files (`index.ts`)

Each `index.ts` re-exports only the public API intended for that layer. Do not export internal helpers or implementation details. Review exports when adding or removing symbols.
