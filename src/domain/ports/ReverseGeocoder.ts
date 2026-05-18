/**
 * Port interface for reverse geocoding providers.
 *
 * Application code depends on this abstraction rather than on any concrete
 * implementation, enabling provider substitution via dependency injection.
 *
 * **Naming note:** This is the domain **port** (`ReverseGeocoder` interface).
 * The application-layer orchestrator class (Nominatim + AWS + observers) lives
 * at `src/application/services/ReverseGeocoder.ts` and is exported from the
 * package root as {@link ReverseGeocoderService} to avoid clashing with this port.
 *
 * @module domain/ports/ReverseGeocoder
 * @since 1.2.5
 * @author Marcelo Pereira Barbosa
 */

import type { GeoAddress } from '../entities/GeoAddress';
import type { GeoReverseGeocodeError } from '../entities/GeoReverseGeocodeError';

export type { GeoAddress, GeoReverseGeocodeError };

/**
 * Port that all reverse geocoding providers must satisfy.
 *
 * Uses an interface (Promise-based API) rather than an abstract class because
 * reverse geocoding is a single async operation. {@link GeolocationProvider}
 * remains an abstract class for the callback-based browser Geolocation API.
 *
 * @example
 * class AwsGeocoder implements ReverseGeocoder {
 *   async reverseGeocode(latitude: number, longitude: number): Promise<GeoAddress> { ... }
 * }
 */
export interface ReverseGeocoder {
	/**
	 * Resolves a geographic coordinate pair to a structured address.
	 *
	 * @param latitude  - Decimal-degree latitude.
	 * @param longitude - Decimal-degree longitude.
	 * @returns A {@link GeoAddress} for the given coordinates.
	 * @throws {@link GeoReverseGeocodeError} (as `Error` with a `code` field)
	 *         when coordinates are invalid (code `1`), the network fails (code `2`),
	 *         or the provider returns a non-success response (code `3`).
	 */
	reverseGeocode(latitude: number, longitude: number): Promise<GeoAddress>;
}
