# Getting Started

## Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- TypeScript ≥ 5 (peer dependency)

---

## Installation

```bash
npm install paraty_geoservices
```

---

## Quick Start

### 1. Pick (or create) a provider

The library ships with both a browser adapter and a deterministic mock adapter. Import the one that matches your runtime:

```typescript
import { BrowserGeolocationProvider } from 'paraty_geoservices';

const provider = new BrowserGeolocationProvider();

if (!provider.isSupported()) {
  throw new Error('Geolocation is not available in this environment.');
}

if (provider.isPermissionsAPISupported()) {
  console.log('Permissions API is available.');
}
```

You can also inject a navigator object explicitly when testing or integrating with a custom runtime:

```typescript
const mockNavigator = {
  geolocation: {
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
  },
};

const provider = new BrowserGeolocationProvider(mockNavigator as Navigator);

console.log(provider.getNavigator() === mockNavigator); // true
```

For tests, use the built-in mock provider instead of hand-rolling a fake:

```typescript
import {
  MockGeolocationProvider,
  GetCurrentPositionUseCase,
} from 'paraty_geoservices';

const provider = new MockGeolocationProvider({
  defaultPosition: {
    coords: {
      latitude: -23.3045,
      longitude: -44.7213,
      accuracy: 5,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: Date.now(),
  },
  delay: 0,
});

const useCase = new GetCurrentPositionUseCase(provider);
const output = await useCase.execute();
console.log(output.position.coords.latitude);
```

If you want the higher-level service façade in a browser environment, use the
built-in infrastructure factory instead of constructing the browser provider
inside application code:

```typescript
import { createBrowserGeolocationService } from 'paraty_geoservices';

const service = createBrowserGeolocationService({
  geolocationOptions: { enableHighAccuracy: true },
});

const position = await service.getSingleLocationUpdate();
console.log(position.coords.latitude);
```

If you need reverse geocoding against an AWS Location Service-compatible
endpoint, the library also ships with an HTTP adapter:

```typescript
import { AwsGeocoder } from 'paraty_geoservices';

const geocoder = new AwsGeocoder(process.env.AWS_LBS_BASE_URL);
const result = await geocoder.reverseGeocode(-23.55052, -46.633309);

console.log(result.enderecoPadronizado.cep);
```

`AwsGeocoder` sends a `POST` request to
`<baseUrl>/api/geocode/reverse`. You can either pass the base URL explicitly or
set the `AWS_LBS_BASE_URL` environment variable.

### 2. Get the current position (once)

```typescript
import {
  BrowserGeolocationProvider,
  GetCurrentPositionUseCase,
} from 'paraty_geoservices';

const provider = new BrowserGeolocationProvider();
const useCase  = new GetCurrentPositionUseCase(provider);

try {
  const { position } = await useCase.execute({ enableHighAccuracy: true });
  console.log('Latitude :', position.coords.latitude);
  console.log('Longitude:', position.coords.longitude);
} catch (err) {
  // err is a GeoPositionError { code: 1 | 2 | 3, message: string }
  console.error('Could not acquire position:', err);
}
```

If the provider is used in an environment without geolocation support, it rejects with a `GeoPositionError` carrying code `2` and the message `Geolocation is not supported`.

### 3. Watch for position changes

```typescript
import {
  BrowserGeolocationProvider,
  WatchPositionUseCase,
} from 'paraty_geoservices';

const provider = new BrowserGeolocationProvider();
const watcher  = new WatchPositionUseCase(provider);

watcher.start(
  (position) => {
    console.log('Updated position:', position.coords);
  },
  (error) => {
    console.error('Watch error:', error.message);
  },
  { enableHighAccuracy: true },
);

// Later — stop watching
watcher.stop();
```

---

## Using the built-in mock provider

`MockGeolocationProvider` is useful when you need deterministic tests for success paths, error paths, delayed callbacks, and manual watch updates:

```typescript
import {
  MockGeolocationProvider,
  WatchPositionUseCase,
} from 'paraty_geoservices';

const provider = new MockGeolocationProvider({
  defaultPosition: {
    coords: {
      latitude: -23.3045,
      longitude: -44.7213,
      accuracy: 5,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: Date.now(),
  },
});

const watcher = new WatchPositionUseCase(provider);
watcher.start(
  (position) => console.log('Initial or updated mock position:', position.coords),
  (error) => console.error('Mock watch error:', error.message),
);

provider.triggerWatchUpdate({
  coords: {
    latitude: -22.9068,
    longitude: -43.1729,
    accuracy: 5,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
  },
  timestamp: Date.now(),
});
```

`watchPosition()` schedules an immediate callback with the configured position or error, so zero-delay tests should still treat its callbacks as asynchronous.

---

## Implementing a Custom Provider

Extend `GeolocationProvider` to integrate any location source:

```typescript
import {
  GeolocationProvider,
  GeoPosition,
  GeoPositionError,
  GeoPositionOptions,
} from 'paraty_geoservices';

class ExampleGeolocationProvider extends GeolocationProvider {
  private readonly examplePosition: GeoPosition = {
    coords: {
      latitude: -23.3045,
      longitude: -44.7213,
      accuracy: 5,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: Date.now(),
  };

  getCurrentPosition(
    success: (pos: GeoPosition) => void,
    _error: (err: GeoPositionError) => void,
    _options?: GeoPositionOptions,
  ): void {
    success(this.examplePosition);
  }

  watchPosition(
    success: (pos: GeoPosition) => void,
    _error: (err: GeoPositionError) => void,
    _options?: GeoPositionOptions,
  ): number {
    success(this.examplePosition);
    return 1;
  }

  clearWatch(_watchId: number): void {}

  isSupported(): boolean {
    return true;
  }
}
```

Inject it into any use case — no code changes required anywhere else:

```typescript
const provider = new ExampleGeolocationProvider();
const useCase = new GetCurrentPositionUseCase(provider);
const output  = await useCase.execute();
```

---

## Type Reference

| Type | Description |
|---|---|
| `GeoPosition` | Position fix: `coords` (lat, lon, accuracy, …) + `timestamp` |
| `GeoPositionError` | Error object: `code` (1–3) + `message` |
| `GeoPositionOptions` | `enableHighAccuracy?`, `timeout?`, `maximumAge?` |
| `GetCurrentPositionOutput` | `{ position: GeoPosition }` returned by `GetCurrentPositionUseCase` |

Error codes follow the [W3C Geolocation API spec](https://www.w3.org/TR/geolocation/#position_error_interface):

| Code | Constant | Meaning |
|---|---|---|
| `1` | `PERMISSION_DENIED` | User rejected the permission prompt |
| `2` | `POSITION_UNAVAILABLE` | Hardware or network could not determine position |
| `3` | `TIMEOUT` | Position was not acquired within `options.timeout` ms |

---

## Full API Reference

Run `npm run docs` to regenerate, then open `docs/api/index.html` in a browser.
