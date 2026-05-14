# Code Quality Assessment — `AwsGeocoder.ts`

**Guide version:** `CODE_QUALITY_CONTROL_GUIDE.md` v1.0.0  
**Assessed file:** `src/infrastructure/providers/AwsGeocoder.ts`  
**Assessment date:** 2026-05-14

---

## Overall verdict

| Gate | Status | Summary |
|------|--------|---------|
| 1. Responsibility | ⚠️ Fail | Class conflates transport, parsing, normalization, and env resolution |
| 2. Boundary | ⚠️ Fail | Provider-specific shapes are exported without justification |
| 3. Domain-alignment | ⚠️ Fail | Domain vocabulary and port interface are absent |
| 4. Purity | ✅ Pass | Pure helpers are static and side-effect-free |
| 5. Test | ⚠️ Partial | Transport scenarios are covered; pure helpers lack direct unit tests |
| 6. Documentation | ⚠️ Partial | Method JSDoc is good; exported interfaces are undocumented |
| 7. Architecture | ✅ Pass | File is correctly placed in `src/infrastructure/` |
| 8. Validation | Not run | `npm test` / `npm run build` not executed during this review |

---

## Gate 1 — Responsibility

**Status: ⚠️ Fail**

The guide explicitly calls out `AwsGeocoder` as an example of an adapter that _should_ wrap transport behavior, not bundle unrelated concerns. The current implementation does all of the following in a single class:

- HTTP transport (`reverseGeocode` via `fetch`)
- Coordinate validation (`Number.isFinite` guard)
- Address assembly (`toBrazilianStandardAddress`)
- Label parsing and stripping (`parseLabel`)
- Country normalization (`normalizeCountry`)
- State abbreviation resolution (`resolveStateSigla`)
- Environment variable resolution (`resolveBaseUrlFromEnvironment`)

A description of the class currently requires repeated "and", which is the guide's signal to split or extract.

**Recommendation:** Extract the pure address-mapping logic (`toBrazilianStandardAddress`, `parseLabel`, `normalizeCountry`, `resolveStateSigla`) into a dedicated, standalone helper (e.g., `AwsAddressMapper`). Keep `AwsGeocoder` focused on HTTP orchestration only.

---

## Gate 2 — Boundary

**Status: ⚠️ Fail**

All four exported interfaces (`AwsAddress`, `AwsReverseGeocodeResponse`, `BrazilianStandardAddress`, `AwsReverseGeocodeResult`) are provider-specific shapes. The guide requires that public APIs expose library-owned concepts (`GeoAddress`, `GeoPosition`) and that any intentional provider-shape leak be **explicitly justified and documented**.

No justification or documentation for the leaks is present. Additionally:

- `AwsReverseGeocodeResult.enderecoPadronizado` is a Portuguese-named field on a public type, inconsistent with library-level API naming conventions.
- `AwsReverseGeocodeResult.rawData` exposes the provider response directly to callers with no domain translation requirement.

**Recommendation:**
- Have `reverseGeocode` return a library-owned type (`GeoAddress` or equivalent) as its primary output.
- Move raw-response access to an opt-in escape hatch (e.g., a secondary method or explicit `rawData` property documented as internal).
- If the provider shape _must_ be exported, add a JSDoc comment explicitly noting the intentional leak and the reason.

---

## Gate 3 — Domain-alignment

**Status: ⚠️ Fail**

The class uses no established project vocabulary. The guide lists `GeoAddress`, `GeoPosition`, `GeolocationProvider`, `CoordinateValidator`, and `ReverseGeocoder` as the ubiquitous language. None of these appear in `AwsGeocoder.ts`.

Specific observations:

- `AwsGeocoder` does not implement any port interface (`GeolocationProvider`, `ReverseGeocoder`, or similar). This means the class cannot be swapped via dependency injection, which is required by the architecture guide.
- `BrazilianStandardAddress` duplicates address-value semantics that likely overlap with an existing or future `GeoAddress` domain type.
- Mixed-language naming (`enderecoPadronizado`, `siglaUF`, `logradouro`, `bairro`, `municipio`, `uf`, `cep`, `pais` in Portuguese alongside `rawData` in English) is inconsistent at the type-boundary level.

**Recommendation:**
- Implement the relevant port interface (e.g., `GeolocationProvider`) so `AwsGeocoder` is injectable.
- Map `BrazilianStandardAddress` to `GeoAddress` or whichever canonical domain type represents an address.
- Confine Portuguese field names to the internal mapping layer; expose only English-named domain types at the public boundary.

---

## Gate 4 — Purity

**Status: ✅ Pass**

All four private static methods (`toBrazilianStandardAddress`, `parseLabel`, `resolveStateSigla`, `normalizeCountry`) are pure: they take explicit inputs, produce deterministic outputs, and have no side effects. `resolveBaseUrlFromEnvironment` is the only method that accesses the environment, and it is clearly named and isolated.

The module-level `BRAZIL_CODES` and `BRAZIL_STATE_SIGLAS` constants are immutable (`Set`/`Map` defined at module scope) and treated as read-only, which is acceptable.

**Minor note:** Because these pure helpers are private to the class, they cannot be reused independently or tested directly. Extraction (recommended in Gate 1) would improve both reusability and testability without sacrificing purity.

---

## Gate 5 — Test

**Status: ⚠️ Partial**

`test/infrastructure/providers/AwsGeocoder.test.ts` covers:

- ✅ Constructor: `baseUrl` normalization, env-variable fallback, missing-URL error
- ✅ `reverseGeocode`: correct POST body and headers, successful result shape, zero coordinates, HTTP error, network failure, invalid coordinates
- ✅ Public entry-point re-export

What is missing:

- ❌ No direct unit tests for `parseLabel` (label stripping, bairro detection, postal-code guard, municipality guard).
- ❌ No direct unit tests for `normalizeCountry` (empty string, known variants, unknown country pass-through).
- ❌ No direct unit tests for `resolveStateSigla` (missing region, unknown region, known full-name lookup).
- ❌ No test for a response with a missing or empty `address` object (only tested indirectly via zero-coordinates case).

These helpers have enough edge cases to regress independently. Extracting them (Gate 1 recommendation) would make direct testing straightforward.

---

## Gate 6 — Documentation

**Status: ⚠️ Partial**

What is documented well:

- ✅ File-level JSDoc with `@module`, `@since`, `@author`.
- ✅ Class-level JSDoc explains the env-variable fallback.
- ✅ `reverseGeocode` has complete `@param`, `@returns`, and `@throws` tags.

What is missing:

- ❌ All four exported interfaces (`AwsAddress`, `AwsReverseGeocodeResponse`, `BrazilianStandardAddress`, `AwsReverseGeocodeResult`) have no JSDoc, so their purpose, field semantics, and provenance are invisible to consumers.
- ❌ No documentation justifying why provider-specific shapes are exported (required by Gate 2).
- ❌ No `@since` tags on the exported interfaces.

**Recommendation:** Add at least a one-line JSDoc to each exported interface. If provider-specific shapes are kept, include a note explaining the intentional exposure.

---

## Gate 7 — Architecture

**Status: ✅ Pass**

- `AwsGeocoder.ts` lives in `src/infrastructure/providers/` — the correct layer.
- `fetch` is used only inside `src/infrastructure/` — acceptable per the guide.
- No imports from domain or application layers were introduced.
- No domain or application files were modified.

The one structural concern (not addressed here but worth noting) is that `AwsGeocoder` is not wired through a port, which means application code would have to import the concrete class directly — violating the dependency-inversion requirement at use-site. This is a Gate 3 finding, not a Gate 7 finding.

---

## Gate 8 — Validation

**Status: Not run**

Repository validation commands (`npm test`, `npm run build`) were not executed as part of this review. They should be run before merging any changes made in response to these findings.

---

## Summary of recommended actions

1. **Extract address-mapping helpers** into a separate module (e.g., `AwsAddressMapper.ts`) — resolves Gate 1 and improves Gate 5 testability.
2. **Implement a port interface** (e.g., `GeolocationProvider` or `ReverseGeocoder`) — resolves Gate 3 and enables dependency injection.
3. **Map to domain types** (`GeoAddress`) at the public boundary; demote `BrazilianStandardAddress` to an internal intermediate type — resolves Gate 2 and Gate 3.
4. **Add JSDoc to exported interfaces** — resolves Gate 6.
5. **Add direct unit tests for extracted helpers** once they are standalone — resolves Gate 5.
