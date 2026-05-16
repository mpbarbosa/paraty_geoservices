---
name: project-architecture
description: Clean Architecture rules for paraty_geoservices — CDN dependency policy, application-layer port pattern, domain type alignment
metadata:
  type: project
---

Application layer must depend only on locally-defined ports and domain types. CDN imports (`cdn.jsdelivr.net`, `DualObserverSubject`, `logger`) are banned from `src/application/` and `src/domain/`.

**Pattern established in `ChangeDetectionCoordinator` refactor (2026-05-15):**
- Export narrow interfaces from the application service file itself (`ILogger`, `IObserverSubject`, `IAddressComponentExtractor`, `IAddressState`)
- Inject all collaborators via the constructor
- Use domain types (`GeoAddress`, `GeoPosition`) throughout — no `unknown` or locale-specific field names
- Export typed event shapes (`AddressFieldChangeEvent`, `AddressChangeType`) instead of passing `unknown` or `Record<string, unknown>`
- Infrastructure adapters bridge external CDN API to these ports (out of scope of application layer)

**Why:** Code quality assessment (2026-05-15) found CDN imports in application layer violated dependency rule and prevented type-safe contracts.

**How to apply:** Any future service in `src/application/` that needs an external library must wrap it behind a locally-defined interface. CDN imports belong only in `src/infrastructure/`.
