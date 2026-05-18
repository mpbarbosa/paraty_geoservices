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
export { createGeoReverseGeocodeError } from './domain/entities/GeoReverseGeocodeError.js';
export { GeolocationProvider } from './domain/ports/GeolocationProvider.js';
// Application — use cases, services & DTOs
export { GetCurrentPositionUseCase } from './application/use-cases/GetCurrentPositionUseCase.js';
export { WatchPositionUseCase } from './application/use-cases/WatchPositionUseCase.js';
export { GeolocationService } from './application/services/GeolocationService.js';
export { ChangeDetectionCoordinator } from './application/services/ChangeDetectionCoordinator.js';
/** Full orchestrator (Nominatim + AWS + observers); distinct from the {@link ReverseGeocoder} port. */
export { ReverseGeocoder as ReverseGeocoderService, } from './application/services/ReverseGeocoder.js';
export { ADDRESS_FETCHED_EVENT, GEOCODING_ERROR_EVENT, POSITION_UPDATE_EVENT, IMMEDIATE_ADDRESS_UPDATE_EVENT, } from './application/services/reverseGeocoderEvents.js';
// Utils
export { throttle } from './utils/throttle.js';
// Infrastructure — concrete adapters
export { AwsGeocoder } from './infrastructure/providers/AwsGeocoder.js';
export { BrowserGeolocationProvider } from './infrastructure/providers/BrowserGeolocationProvider.js';
export { MockGeolocationProvider } from './infrastructure/providers/MockGeolocationProvider.js';
export { MockReverseGeocoder } from './infrastructure/providers/MockReverseGeocoder.js';
export { createBrowserGeolocationService } from './infrastructure/createBrowserGeolocationService.js';
export { createReverseGeocoderService } from './infrastructure/createReverseGeocoderService.js';
export { NominatimGeocoder } from './infrastructure/providers/NominatimGeocoder.js';
