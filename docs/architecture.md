# Architecture

`paraty_geoservices` is structured following **Clean Architecture**, with a strict dependency rule:

> Source code dependencies point **inward only** — outer layers depend on inner layers, never the reverse.

```
┌──────────────────────────────────────────────────┐
│              Infrastructure                       │
│  BrowserGeolocationProvider                       │
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

---

### Infrastructure (`src/infrastructure/`)

Concrete adapters that connect the domain ports to real external systems.  
**Depends on:** domain (and optionally application).  
**May use:** browser APIs, Node.js built-ins, third-party SDKs.

| File | Class | Adapts |
|---|---|---|
| `providers/BrowserGeolocationProvider.ts` | `BrowserGeolocationProvider` | `navigator.geolocation` (Web Geolocation API) |

---

## Data Flow

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
