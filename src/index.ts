/**
 * paraty_geoservices — Public API
 *
 * Re-exports all public types, ports, use cases and infrastructure adapters
 * from the Clean Architecture layers.
 *
 * @module index
 * @since 1.0.2
 * @author Marcelo Pereira Barbosa
 */

// Domain — entities & ports
export type { GeoAddress } from './domain/entities/GeoAddress';
export type { GeoPosition } from './domain/entities/GeoPosition';
export type { GeoPositionError } from './domain/entities/GeoPositionError';
export type { GeoPositionOptions } from './domain/entities/GeoPositionOptions';
export type {
	GeolocationPermissionReader,
	GeolocationPermissionState,
} from './domain/ports/GeolocationPermissionReader';
export { GeolocationProvider } from './domain/ports/GeolocationProvider';
export type { ReverseGeocoder } from './domain/ports/ReverseGeocoder';

// Application — use cases, services & DTOs
export { GetCurrentPositionUseCase } from './application/use-cases/GetCurrentPositionUseCase';
export { WatchPositionUseCase } from './application/use-cases/WatchPositionUseCase';
export type { GetCurrentPositionOutput } from './application/dtos/GetCurrentPositionOutput';
export { GeolocationService } from './application/services/GeolocationService';
export type { GeolocationServiceConfig } from './application/services/GeolocationService';

// Utils
export { throttle } from './utils/throttle';
export type { ThrottledFunction } from './utils/throttle';

// Infrastructure — concrete adapters
export { AwsGeocoder } from './infrastructure/providers/AwsGeocoder';
export type {
  AwsAddress,
  AwsReverseGeocodeResponse,
} from './infrastructure/providers/AwsGeocoder';
export { BrowserGeolocationProvider } from './infrastructure/providers/BrowserGeolocationProvider';
export { MockGeolocationProvider } from './infrastructure/providers/MockGeolocationProvider';
export { createBrowserGeolocationService } from './infrastructure/createBrowserGeolocationService';
export type {
  CreateBrowserGeolocationServiceConfig,
} from './infrastructure/createBrowserGeolocationService';
