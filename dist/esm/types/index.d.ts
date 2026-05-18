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
export type { GeoAddress } from './domain/entities/GeoAddress';
export type { GeoPosition } from './domain/entities/GeoPosition';
export type { GeoPositionError } from './domain/entities/GeoPositionError';
export type { GeoPositionOptions } from './domain/entities/GeoPositionOptions';
export type { GeoReverseGeocodeError } from './domain/entities/GeoReverseGeocodeError';
export { createGeoReverseGeocodeError } from './domain/entities/GeoReverseGeocodeError';
export type { GeolocationPermissionReader, GeolocationPermissionState, } from './domain/ports/GeolocationPermissionReader';
export { GeolocationProvider } from './domain/ports/GeolocationProvider';
export type { ReverseGeocoder } from './domain/ports/ReverseGeocoder';
export { GetCurrentPositionUseCase } from './application/use-cases/GetCurrentPositionUseCase';
export { WatchPositionUseCase } from './application/use-cases/WatchPositionUseCase';
export type { GetCurrentPositionOutput } from './application/dtos/GetCurrentPositionOutput';
export { GeolocationService } from './application/services/GeolocationService';
export type { GeolocationServiceConfig } from './application/services/GeolocationService';
export { ChangeDetectionCoordinator } from './application/services/ChangeDetectionCoordinator';
/** Full orchestrator (Nominatim + AWS + observers); distinct from the {@link ReverseGeocoder} port. */
export { ReverseGeocoder as ReverseGeocoderService, } from './application/services/ReverseGeocoder';
export type { ReverseGeocoderConfig } from './application/services/ReverseGeocoder';
export { ADDRESS_FETCHED_EVENT, GEOCODING_ERROR_EVENT, POSITION_UPDATE_EVENT, IMMEDIATE_ADDRESS_UPDATE_EVENT, } from './application/services/reverseGeocoderEvents';
export type { AddressFieldChangeEvent, AddressChangeType, IAddressChangeObserver, IObserverSubject, IAddressComponentExtractor, IAddressState, ILogger, } from './application/services/ChangeDetectionCoordinator';
export { throttle } from './utils/throttle';
export type { ThrottledFunction } from './utils/throttle';
export { AwsGeocoder } from './infrastructure/providers/AwsGeocoder';
export type { AwsAddress, AwsReverseGeocodeResponse, } from './infrastructure/providers/AwsGeocoder';
export { BrowserGeolocationProvider } from './infrastructure/providers/BrowserGeolocationProvider';
export { MockGeolocationProvider } from './infrastructure/providers/MockGeolocationProvider';
export { MockReverseGeocoder } from './infrastructure/providers/MockReverseGeocoder';
export type { MockReverseGeocoderConfig } from './infrastructure/providers/MockReverseGeocoder';
export { createBrowserGeolocationService } from './infrastructure/createBrowserGeolocationService';
export type { CreateBrowserGeolocationServiceConfig, } from './infrastructure/createBrowserGeolocationService';
export { createReverseGeocoderService } from './infrastructure/createReverseGeocoderService';
export type { CreateReverseGeocoderServiceConfig, LegacyFetchManager, } from './infrastructure/createReverseGeocoderService';
export { NominatimGeocoder } from './infrastructure/providers/NominatimGeocoder';
export type { NominatimGeocoderConfig } from './infrastructure/providers/NominatimGeocoder';
