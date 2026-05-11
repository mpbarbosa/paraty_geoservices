# paraty_geoservices

A reverse geocoding service library developed in TypeScript and Node.js.

## Installation

```bash
npm install paraty_geoservices
```

## Usage

```typescript
import { reverseGeocode } from 'paraty_geoservices';

const result = await reverseGeocode({ latitude: 40.7128, longitude: -74.0060 });
console.log(result);
```

---

## GeolocationProvider

`GeolocationProvider` is an **abstract base class** that defines the contract all geolocation providers must implement. It enables dependency injection and decouples consumers from concrete location sources (browser Geolocation API, GPS hardware, mocks, etc.).

### Exported symbols

| Symbol | Kind | Description |
|---|---|---|
| `GeolocationProvider` | `abstract class` | Base class every provider must extend |
| `GeoPosition` | `interface` | Shape of an acquired position object |
| `GeoPositionError` | `interface` | Shape of a geolocation error |
| `GeoPositionOptions` | `interface` | Options for position acquisition |

### Creating a custom provider

Extend `GeolocationProvider` and implement all four abstract methods:

```typescript
import GeolocationProvider, {
  GeoPosition,
  GeoPositionError,
  GeoPositionOptions,
} from 'paraty_geoservices/GeolocationProvider';

class BrowserGeolocationProvider extends GeolocationProvider {
  isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'geolocation' in navigator;
  }

  getCurrentPosition(
    successCallback: (pos: GeoPosition) => void,
    errorCallback: (err: GeoPositionError) => void,
    options?: GeoPositionOptions,
  ): void {
    navigator.geolocation.getCurrentPosition(
      successCallback as PositionCallback,
      errorCallback as PositionErrorCallback,
      options,
    );
  }

  watchPosition(
    successCallback: (pos: GeoPosition) => void,
    errorCallback: (err: GeoPositionError) => void,
    options?: GeoPositionOptions,
  ): number | null {
    if (!this.isSupported()) return null;
    return navigator.geolocation.watchPosition(
      successCallback as PositionCallback,
      errorCallback as PositionErrorCallback,
      options,
    );
  }

  clearWatch(watchId: number): void {
    navigator.geolocation.clearWatch(watchId);
  }
}
```

### API reference

#### `getCurrentPosition(successCallback, errorCallback, options?)`

Requests the device position once.

| Parameter | Type | Description |
|---|---|---|
| `successCallback` | `(pos: GeoPosition) => void` | Called with the acquired position |
| `errorCallback` | `(err: GeoPositionError) => void` | Called when acquisition fails |
| `options` | `GeoPositionOptions` *(optional)* | Accuracy, timeout, and caching hints |

#### `watchPosition(successCallback, errorCallback, options?)`

Subscribes to continuous position updates. Returns a watch ID (or `null` if unsupported).

#### `clearWatch(watchId)`

Cancels a subscription started by `watchPosition`.

#### `isSupported()`

Returns `true` if the provider can supply geolocation data in the current environment.

---

## Development

```bash
npm test              # run unit tests
npm run test:coverage # run tests with coverage report
npm run build         # compile TypeScript to dist/
