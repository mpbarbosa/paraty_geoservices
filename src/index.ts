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

// Domain — entities & port
export type { GeoPosition } from './domain/entities/GeoPosition';
export type { GeoPositionError } from './domain/entities/GeoPositionError';
export type { GeoPositionOptions } from './domain/entities/GeoPositionOptions';
export { GeolocationProvider } from './domain/ports/GeolocationProvider';

// Application — use cases & DTOs
export { GetCurrentPositionUseCase } from './application/use-cases/GetCurrentPositionUseCase';
export { WatchPositionUseCase } from './application/use-cases/WatchPositionUseCase';
export type { GetCurrentPositionOutput } from './application/dtos/GetCurrentPositionOutput';

// Infrastructure — concrete adapters
export { AwsGeocoder } from './infrastructure/providers/AwsGeocoder';
export type {
  AwsAddress,
  AwsReverseGeocodeResponse,
  AwsReverseGeocodeResult,
  BrazilianStandardAddress,
} from './infrastructure/providers/AwsGeocoder';
export { BrowserGeolocationProvider } from './infrastructure/providers/BrowserGeolocationProvider';
export { MockGeolocationProvider } from './infrastructure/providers/MockGeolocationProvider';
