# Clean Architecture Guide

**Document version:** `1.0.0`

Clean Architecture is the foundational design principle for `paraty_geoservices`.

This repository is organized into three concentric layers that follow the
Dependency Rule:

- `src/domain/` for entities, value objects, and abstract ports — no external dependencies
- `src/application/` for use-case orchestration — depends only on the domain
- `src/infrastructure/` for concrete adapters: HTTP clients, browser APIs, and test doubles

This guide explains what Clean Architecture means in this codebase, why the
layering exists, and how to preserve it as the library grows.

## Goal

All source code dependencies must point inward only. Outer layers depend on inner
layers. Inner layers must never depend on outer layers, framework internals, or
infrastructure details.

## What Clean Architecture Means

Clean Architecture is a layered structure where the most volatile code (I/O,
frameworks, browsers, HTTP) is kept at the outside, and the most stable code
(domain rules, contracts) is kept at the centre.

A correctly layered module can be described in terms of what it owns:

- "`GeolocationProvider` defines the contract every location source must satisfy."
- "`GetCurrentPositionUseCase` orchestrates a single-shot position request using that contract."
- "`BrowserGeolocationProvider` fulfils the contract by delegating to `navigator.geolocation`."
- "`AwsGeocoder` fulfils reverse-geocoding by calling an AWS-compatible HTTP endpoint."

If a domain entity imports a browser API, or a use case references `fetch`, the
Dependency Rule has been broken.

## Why It Matters

1. It decouples domain logic from volatile runtime details such as browsers and HTTP.
2. It allows providers to be swapped without touching application or domain code.
3. It makes every use case fully testable with no real device, browser, or network.
4. It keeps the inner layers stable and safe to reason about in isolation.
5. It reduces the blast radius of external API changes to the infrastructure layer only.

## Clean Architecture and Code LLMs

Clean Architecture also improves the quality of LLM-assisted coding.

Code-focused models work best when the layer of a file is immediately clear from
its location and imports. In this repository, a model can determine at a glance
whether a file is a domain contract, an orchestration step, or a concrete adapter
— and apply edits only to the appropriate scope.

### Why LLMs Benefit

- Layer location makes the intent of every file predictable.
- Inward-only imports prevent hidden cross-layer side effects.
- Isolated domain code is safe to reason about without tracing infrastructure.
- Use cases are thin orchestrators — their logic is easy to read and modify.
- Tests use `MockGeolocationProvider` so no environment setup is required.

### Where Violations Hurt LLMs

- Infrastructure imports in domain files blur what "pure domain logic" means.
- Business logic in adapters forces changes in two places for a single rule.
- Missing port abstractions cause models to assume direct dependencies are correct.
- Mixed layer responsibilities make automated refactoring unpredictable.

## Layer Structure

```
┌──────────────────────────────────────────────────┐
│              Infrastructure                       │
│  AwsGeocoder                                      │
│  BrowserGeolocationProvider                       │
│  MockGeolocationProvider                          │
│                                                   │
│   ┌──────────────────────────────────────────┐   │
│   │           Application                    │   │
│   │  GetCurrentPositionUseCase               │   │
│   │  WatchPositionUseCase                    │   │
│   │                                          │   │
│   │   ┌──────────────────────────────────┐   │   │
│   │   │           Domain                 │   │   │
│   │   │  Entities  │  Ports (abstract)   │   │   │
│   │   └──────────────────────────────────┘   │   │
│   └──────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

Arrows represent allowed import direction: always inward, never outward.

## Required Rules

1. Domain files in `src/domain/` must not import from `src/application/` or
   `src/infrastructure/`.
2. Application files in `src/application/` must not import from
   `src/infrastructure/`.
3. Infrastructure files in `src/infrastructure/` may import domain ports and
   entities; they must not contain business rules.
4. New providers must extend `GeolocationProvider` from
   `src/domain/ports/GeolocationProvider.ts`, not implement an ad-hoc interface.
5. Use cases must receive their provider via constructor injection — never
   construct a provider internally.
6. DTOs in `src/application/dtos/` must not import from `src/infrastructure/`.
7. No layer may depend on a specific runtime (browser, Node.js, AWS SDK) except
   `src/infrastructure/`.
8. `MockGeolocationProvider` is an infrastructure adapter — it belongs in
   `src/infrastructure/providers/`, not in test utilities.

## Positive Signals

- Domain files have zero imports from application or infrastructure.
- Use case constructors accept a `GeolocationProvider` parameter, not a concrete class.
- Adding a new provider requires changes only in `src/infrastructure/`.
- Tests instantiate a `MockGeolocationProvider` with no browser or network setup.
- Changing the HTTP endpoint in `AwsGeocoder` requires no edits to domain or application files.
- New use cases can be written and tested before any concrete adapter exists.

## Warning Signs

- A domain entity imports `fetch`, `navigator`, or any browser/Node.js API.
- A use case calls `new BrowserGeolocationProvider()` internally.
- Infrastructure adapters contain conditional business logic beyond data mapping.
- A provider extends `GeolocationProvider` but also orchestrates application flows.
- An application DTO re-exports infrastructure types directly.
- Test files import concrete adapters to test use-case logic.

## Applying Clean Architecture in This Repository

| Component type | Responsibility in this project |
| --- | --- |
| `src/domain/entities/` | Plain TypeScript interfaces for `GeoPosition`, `GeoPositionError`, and `GeoPositionOptions` — pure data shapes with no runtime dependencies |
| `src/domain/ports/` | Abstract `GeolocationProvider` base class — the contract all location adapters must fulfill |
| `src/application/use-cases/` | `GetCurrentPositionUseCase` and `WatchPositionUseCase` — thin orchestrators that wrap the port in a clean async API |
| `src/application/dtos/` | Output shapes crossing the use-case boundary, such as `GetCurrentPositionOutput` |
| `src/infrastructure/providers/` | Concrete adapters: `BrowserGeolocationProvider`, `AwsGeocoder`, and `MockGeolocationProvider` |

Keep new code in the narrowest layer that matches its real job.

## Best Practices

### When Creating a New Provider

1. Create the file in `src/infrastructure/providers/`.
2. Extend `GeolocationProvider` from `src/domain/ports/GeolocationProvider.ts`.
3. Implement all four abstract methods: `getCurrentPosition`, `watchPosition`,
   `clearWatch`, and `isSupported`.
4. Export the class from `src/infrastructure/providers/index.ts`.
5. Write tests that inject the new provider directly — no use-case changes needed.

### When Creating a New Use Case

1. Create the file in `src/application/use-cases/`.
2. Declare the required port or entity types as constructor parameters.
3. Never import a concrete provider or infrastructure adapter.
4. Return a DTO from `src/application/dtos/` or a domain type — not raw
   infrastructure shapes.
5. Write tests by passing a `MockGeolocationProvider` or an inline test double.

### When Adding Domain Types

1. Place pure data shapes (interfaces, enums) in `src/domain/entities/`.
2. Place abstract contracts in `src/domain/ports/`.
3. Keep domain files free of imports from any other layer.
4. Do not add runtime behaviour (HTTP, I/O, browser checks) to domain files.

## Refactoring for Clean Architecture

When a file contains cross-layer dependencies or mixed responsibilities, refactor
around the Dependency Rule.

1. Identify which layer the file logically belongs to.
2. List every import and classify each as domain, application, or infrastructure.
3. Move any import that points outward to a boundary: extract an interface or
   introduce a port.
4. Relocate the file to the correct `src/` subdirectory if necessary.
5. Update the barrel `index.ts` exports to reflect the new location.
6. Re-run tests to confirm no behaviour changed.

## Review Heuristics

### Dependency Direction Test

Does every import in this file point inward or stay within the same layer? If an
import points outward, the Dependency Rule is violated.

### Constructor Injection Test

Does this use case or orchestrator receive its dependencies as constructor
parameters? If it creates concrete adapters internally, the layer boundary is
blurred.

This matters even more in LLM-assisted work: a use case that instantiates its own
provider cannot be safely tested or modified without touching infrastructure.

### Layer Location Test

Does the file live in the correct `src/` subdirectory? A domain type discovered in
`src/infrastructure/` or a concrete adapter in `src/application/` signals the
structure needs repair.

### Isolation Test

Can this file be tested in isolation from all runtime environments? Domain and
application files must be testable with no browser, no network, and no real
device — only `MockGeolocationProvider` and plain TypeScript.

## Preferred Fixes

1. Extract domain contracts (abstract classes or interfaces) when application code
   depends on concrete infrastructure.
2. Move business logic out of adapters and into domain or application files.
3. Introduce DTOs at use-case boundaries to decouple application outputs from
   infrastructure shapes.
4. Replace direct provider instantiation in use cases with constructor injection.
5. Split files that span multiple layers into focused, correctly placed modules.

## Summary Checklist

- [ ] The file belongs to one layer and is located in the correct `src/` subdirectory.
- [ ] All imports point inward or stay within the same layer.
- [ ] Domain files have no runtime, framework, or infrastructure dependencies.
- [ ] Use cases receive providers via constructor injection.
- [ ] Infrastructure adapters extend `GeolocationProvider` and contain no business rules.
- [ ] New providers require no changes to application or domain files.
- [ ] Tests rely on `MockGeolocationProvider` or inline test doubles, not concrete adapters.
- [ ] DTOs define the output shape at the application boundary without leaking infrastructure types.
- [ ] A reviewer or code-focused LLM can identify the layer from the file's location and imports alone.

## See Also

- [HIGH_COHESION_GUIDE.md](HIGH_COHESION_GUIDE.md)
- [LOW_COUPLING_GUIDE.md](LOW_COUPLING_GUIDE.md)
- [architecture.md](architecture.md)
- [contributing.md](contributing.md)
