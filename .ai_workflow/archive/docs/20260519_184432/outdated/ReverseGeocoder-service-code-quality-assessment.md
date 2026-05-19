# Code Quality Assessment — `src/application/services/ReverseGeocoder.ts`

**Guide version:** `CODE_QUALITY_CONTROL_GUIDE.md` v1.0.0  
**Assessed file:** `src/application/services/ReverseGeocoder.ts`  
**Assessment date:** 2026-05-17

---

## Overall verdict

| Gate | Status | Summary |
|------|--------|---------|
| 1. Responsibility | ❌ Fail | One class orchestrates observers, HTTP, provider failover, CORS retry, UI errors, and Brazilian normalization |
| 2. Boundary | ❌ Fail | `fetch`, Nominatim URLs, and concrete `AwsGeocoder` live in application; public surface is mostly `unknown` |
| 3. Domain-alignment | ⚠️ Partial | Export alias `ReverseGeocoderService` helps; internals still mix legacy names and skip `GeoReverseGeocodeError` |
| 4. Purity | ❌ Fail | Network and browser side effects in application; only `getOpenStreetMapUrl` is cleanly separable |
| 5. Test | ⚠️ Partial | Broad Nominatim/fetch coverage; gaps on AWS/CORS/provider switch; `global.fetch` not restored; wall-clock waits |
| 6. Documentation | ⚠️ Partial | Naming note exists; file header is legacy-heavy; malformed JSDoc; orchestrator behavior not fully aligned with guides |
| 7. Architecture | ❌ Fail | Application imports infrastructure and performs adapter work |
| 8. Validation | ➖ Not run | Run `npm test` and `npm run build` after remediation |

**Overall:** Ported legacy orchestrator; conflicts with boundary, architecture, and responsibility gates while newer stack (`ReverseGeocoder` port, `AwsGeocoder`, `MockReverseGeocoder`, `GeolocationService`) follows intended patterns.

---

## Gate 1 — Responsibility

**Status: ❌ Fail**

`ReverseGeocoder` combines observer subscription, Nominatim URL/HTTP, AWS vs Nominatim failover, CORS retry, browser UI (`window.ErrorRecovery`, `CustomEvent`), Brazilian address shaping, and legacy `fetchManager` integration.

**Remediation:** Orchestrator only; inject `ReverseGeocoder` port implementations, normalization port, observer port (pattern: `ChangeDetectionCoordinator`).

---

## Gate 2 — Boundary

**Status: ❌ Fail**

- Config exposes `AwsGeocoder` instead of domain port
- Nominatim URL/query building in application
- Return types `unknown` instead of `GeoAddress`
- Legacy `fetchManager`, `AddressDataExtractor`, `enderecoPadronizado`

**Remediation:** Move HTTP to infrastructure adapters; type public API with `GeoAddress`.

---

## Gate 3 — Domain-alignment

**Status: ⚠️ Partial**

Export as `ReverseGeocoderService` is correct. Class does not implement domain port; errors not using `GeoReverseGeocodeError`.

---

## Gate 4 — Purity

**Status: ❌ Fail**

`reverseGeocode` / `fetchAddress` perform I/O in application layer. `getOpenStreetMapUrl` should live in infrastructure.

---

## Gate 5 — Test

**Status: ⚠️ Partial**

Missing: `switchProvider`, AWS failover, CORS retry tests; `global.fetch` restore; fake timers instead of `setTimeout`.

---

## Gate 6 — Documentation

**Status: ⚠️ Partial**

Malformed `fetchAddress` JSDoc; legacy header noise; default provider docs mismatch.

---

## Gate 7 — Architecture

**Status: ❌ Fail**

Application imports `ObserverSubject`, `AwsGeocoder`; uses `fetch`, `window`, constructs `AwsGeocoder` internally.

---

## Additional findings

- Coordinate validation uses falsy check — rejects `(0, y)` and `(x, 0)`
- `getCacheKey()` without caching
- Raw `console.log` alongside injectable `_logger`

---

## Remediation summary (2026-05-17)

| Finding | Resolution |
|---------|------------|
| Architecture / boundary violations | `NominatimGeocoder` adapter; orchestrator injects domain `ReverseGeocoder` ports only |
| `fetch` / `AwsGeocoder` in application | Removed; `createReverseGeocoderService` wires adapters in infrastructure |
| `ObserverSubject` in infrastructure | Moved to `src/application/ObserverSubject.ts` (infrastructure re-exports deprecated) |
| `unknown` address types | `GeoAddress` on `currentAddress` / `standardizedAddress` |
| Falsy coordinate validation | `Number.isFinite` checks (accepts `0`) |
| Legacy `window.ErrorRecovery` | Optional `errorNotifier` in config |
| Tests: no AWS/CORS/factory coverage | Added provider, factory, and `NominatimGeocoder` tests |
| Malformed / verbose JSDoc | Trimmed file header; fixed docs |

**Validation:** `npm test` — 255 passed; `npm run build` — success.

---

## Post-remediation gate status

| Gate | Status |
|------|--------|
| 1. Responsibility | ✅ Pass (orchestration only) |
| 2. Boundary | ✅ Pass |
| 3. Domain-alignment | ✅ Pass |
| 4. Purity | ✅ Pass (application layer) |
| 5. Test | ✅ Pass |
| 6. Documentation | ✅ Pass |
| 7. Architecture | ✅ Pass |
| 8. Validation | ✅ Pass |

**Breaking change:** `new ReverseGeocoder(fetchManager, config)` replaced by `createReverseGeocoderService(fetchManager, config)` or `new ReverseGeocoder({ nominatimGeocoder, ... })`.
