# Architecture

`paraty_geoservices` is structured following **Clean Architecture**, with a strict dependency rule:

> Source code dependencies point **inward only** — outer layers depend on inner layers, never the reverse.

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
│   │  GeolocationService                      │   │
│   │                                          │   │
│   │   ┌──────────────────────────────────┐   │   │
│   │   │           Domain                 │   │   │
│   │   │  Entities  │  Ports (abstract)   │   │   │
│   │   └──────────────────────────────────┘   │   │
│   └──────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

---

## Layers

### Domain (`src/domain/`)

The **innermost** layer — no dependencies on any other layer or framework.

#### Entities (`src/domain/entities/`)

Plain TypeScript interfaces that describe the core data shapes.

| File | Exported type | Description |
|---|---|---|
| `GeoPosition.ts` | `GeoPosition` | Acquired coordinate fix (lat, lon, accuracy, …) |
| `GeoPositionError.ts` | `GeoPositionError` | Provider error (code + message) |
| `GeoPositionOptions.ts` | `GeoPositionOptions` | Accuracy, timeout, and cache hints |

#### Ports (`src/domain/ports/`)

Abstract contracts (in Hexagonal Architecture terms, both _driving_ and _driven_ ports live here).

| File | Exported class | Description |
|---|---|---|
| `GeolocationProvider.ts` | `GeolocationProvider` | Abstract base class every adapter must extend |

The `GeolocationProvider` port defines four operations:

```
getCurrentPosition(success, error, options?) → void
watchPosition(success, error, options?)      → number | null
clearWatch(watchId)                          → void
isSupported()                                → boolean
```

---

### Application (`src/application/`)

Orchestrates domain objects to fulfil business use cases.  
**Depends on:** domain only.  
**Does not know about:** browsers, HTTP, databases, or any runtime detail.

#### DTOs (`src/application/dtos/`)

Output shapes that cross the use-case boundary.

| File | Type | Description |
|---|---|---|
| `GetCurrentPositionOutput.ts` | `GetCurrentPositionOutput` | Wraps a `GeoPosition` for use-case callers |

#### Use Cases (`src/application/use-cases/`)

| File | Class | Description |
|---|---|---|
| `GetCurrentPositionUseCase.ts` | `GetCurrentPositionUseCase` | Wraps `getCurrentPosition` in a `Promise` |
| `WatchPositionUseCase.ts` | `WatchPositionUseCase` | Manages the lifecycle of a position watch |

Each use case receives a `GeolocationProvider` via **constructor injection**, making them fully testable without any real device or browser.

#### Services (`src/application/services/`)

| File | Class | Description |
|---|---|---|
| `GeolocationService.ts` | `GeolocationService` | High-level façade combining single-shot and continuous position access with leading-edge throttling and race-condition protection |

`GeolocationService` wraps any `GeolocationProvider` and adds three capabilities not present in the individual use cases:

- **Leading-edge throttle** on watch callbacks (`setThrottleInterval(ms)`, default 5 s)
- **Race-condition guard** for single-shot requests (`hasPendingRequest()`)
- **Automatic low-accuracy retry** when a high-accuracy `getCurrentPosition` times out (error code 3)

---

### Infrastructure (`src/infrastructure/`)

Concrete adapters that connect the domain ports to real external systems.  
**Depends on:** domain (and optionally application).  
**May use:** browser APIs, Node.js built-ins, third-party SDKs.

| File | Class | Adapts |
|---|---|---|
| `providers/AwsGeocoder.ts` | `AwsGeocoder` | AWS Location Service-compatible reverse-geocoding HTTP endpoint, returning raw payloads plus standardized Brazilian addresses |
| `providers/BrowserGeolocationProvider.ts` | `BrowserGeolocationProvider` | `navigator.geolocation` (Web Geolocation API), with optional navigator injection for tests and custom runtimes |
| `providers/MockGeolocationProvider.ts` | `MockGeolocationProvider` | Deterministic in-memory positions/errors for tests and local development |
| `createBrowserGeolocationService.ts` | `createBrowserGeolocationService` | Composition helper that wires `GeolocationService` to `BrowserGeolocationProvider` in the infrastructure layer |

`AwsGeocoder` is the HTTP-facing reverse-geocoding adapter. It calls an
AWS-compatible `/api/geocode/reverse` endpoint, accepts an explicit base URL or
falls back to `AWS_LBS_BASE_URL`, and normalizes the returned address into a
Brazilian-friendly structure for downstream consumers.

`BrowserGeolocationProvider` is the browser-facing adapter. It can either use the ambient global `navigator` or accept an injected navigator in its constructor, and it exposes the concrete helper methods `isPermissionsAPISupported()`, `getNavigator()`, and `checkPermissions()` for browser-specific capability checks.

`createBrowserGeolocationService` keeps browser-provider construction in the infrastructure layer, satisfying the clean-architecture rule that `src/application/` code must not instantiate concrete adapters.

`MockGeolocationProvider` is the deterministic testing adapter. It implements the same domain port without touching browser APIs, supports fixed positions or fixed errors, can simulate callback delays, and can manually fan out watch updates to active subscribers.

---

## Utils (`src/utils/`)

Pure helper functions with no external dependencies.

| File | Exports | Description |
|---|---|---|
| `throttle.ts` | `throttle`, `ThrottledFunction` | Leading-edge throttle HOF; limits call frequency to at most once per `wait` ms |

---

### Single position request

```
Caller
  │  new GetCurrentPositionUseCase(provider)
  │  await useCase.execute(options)
  ▼
GetCurrentPositionUseCase          [Application]
  │  provider.getCurrentPosition(...)
  ▼
GeolocationProvider (abstract)     [Domain port]
  │  (implemented by)
  ▼
BrowserGeolocationProvider         [Infrastructure]
  │  navigator.geolocation.getCurrentPosition(...)
  ▼
Browser / OS / GPS hardware
```

### Watch position

```
Caller
  │  useCase.start(onUpdate, onError, options)
  ▼
WatchPositionUseCase               [Application]
  │  provider.watchPosition(...)   → watchId stored internally
  ▼
BrowserGeolocationProvider         [Infrastructure]
  │  navigator.geolocation.watchPosition(...)
  ▼
Continuous position updates → onUpdate callback

  │  useCase.stop()
  ▼
WatchPositionUseCase
  │  provider.clearWatch(watchId)
  ▼
BrowserGeolocationProvider
```

---

## Adding a New Provider

1. Create `src/infrastructure/providers/MyProvider.ts`.
2. Extend `GeolocationProvider` from `src/domain/ports/GeolocationProvider`.
3. Implement the four abstract methods.
4. Export from `src/infrastructure/providers/index.ts`.
5. Write tests with `jest`.

No changes to the domain or application layers are needed.
