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
export { createGeoReverseGeocodeError } from './domain/entities/GeoReverseGeocodeError';
export { GeolocationProvider } from './domain/ports/GeolocationProvider';
// Application — use cases, services & DTOs
export { GetCurrentPositionUseCase } from './application/use-cases/GetCurrentPositionUseCase';
export { WatchPositionUseCase } from './application/use-cases/WatchPositionUseCase';
export { GeolocationService } from './application/services/GeolocationService';
export { ChangeDetectionCoordinator } from './application/services/ChangeDetectionCoordinator';
/** Full orchestrator (Nominatim + AWS + observers); distinct from the {@link ReverseGeocoder} port. */
export { ReverseGeocoder as ReverseGeocoderService, } from './application/services/ReverseGeocoder';
export { ADDRESS_FETCHED_EVENT, GEOCODING_ERROR_EVENT, POSITION_UPDATE_EVENT, IMMEDIATE_ADDRESS_UPDATE_EVENT, } from './application/services/reverseGeocoderEvents';
// Utils
export { throttle } from './utils/throttle';
// Infrastructure — concrete adapters
export { AwsGeocoder } from './infrastructure/providers/AwsGeocoder';
export { BrowserGeolocationProvider } from './infrastructure/providers/BrowserGeolocationProvider';
export { MockGeolocationProvider } from './infrastructure/providers/MockGeolocationProvider';
export { MockReverseGeocoder } from './infrastructure/providers/MockReverseGeocoder';
export { createBrowserGeolocationService } from './infrastructure/createBrowserGeolocationService';
export { createReverseGeocoderService } from './infrastructure/createReverseGeocoderService';
export { NominatimGeocoder } from './infrastructure/providers/NominatimGeocoder';
