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
export { GeolocationProvider } from './domain/ports/GeolocationProvider.js';
// Application — use cases & DTOs
export { GetCurrentPositionUseCase } from './application/use-cases/GetCurrentPositionUseCase.js';
export { WatchPositionUseCase } from './application/use-cases/WatchPositionUseCase.js';
// Infrastructure — concrete adapters
export { AwsGeocoder } from './infrastructure/providers/AwsGeocoder.js';
export { BrowserGeolocationProvider } from './infrastructure/providers/BrowserGeolocationProvider.js';
export { MockGeolocationProvider } from './infrastructure/providers/MockGeolocationProvider.js';
