/**
 * Port interface for reverse geocoding providers.
 *
 * Application code depends on this abstraction rather than on any concrete
 * implementation, enabling provider substitution via dependency injection.
 *
 * @module domain/ports/ReverseGeocoder
 * @since 1.2.3
 * @author Marcelo Pereira Barbosa
 */
import type { GeoAddress } from '../entities/GeoAddress';
export type { GeoAddress };
/**
 * Port that all reverse geocoding providers must satisfy.
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
     * @throws When coordinates are invalid, the network is unreachable, or the
     *         provider returns a non-success response.
     */
    reverseGeocode(latitude: number, longitude: number): Promise<GeoAddress>;
}
