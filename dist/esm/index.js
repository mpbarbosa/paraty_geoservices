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
export { GeolocationProvider } from './domain/ports/GeolocationProvider';
// Application — use cases & DTOs
export { GetCurrentPositionUseCase } from './application/use-cases/GetCurrentPositionUseCase';
export { WatchPositionUseCase } from './application/use-cases/WatchPositionUseCase';
// Infrastructure — concrete adapters
export { BrowserGeolocationProvider } from './infrastructure/providers/BrowserGeolocationProvider';
export { MockGeolocationProvider } from './infrastructure/providers/MockGeolocationProvider';
