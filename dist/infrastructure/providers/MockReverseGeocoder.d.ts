/**
 * Mock reverse geocoder for tests and deterministic local development.
 *
 * Implements the {@link ReverseGeocoder} domain port without HTTP or browser APIs.
 *
 * @module infrastructure/providers/MockReverseGeocoder
 * @since 1.2.6
 * @author Marcelo Pereira Barbosa
 */
import type { GeoAddress } from '../../domain/entities/GeoAddress';
import { type GeoReverseGeocodeError } from '../../domain/entities/GeoReverseGeocodeError';
import type { ReverseGeocoder } from '../../domain/ports/ReverseGeocoder';
export interface MockReverseGeocoderConfig {
    defaultAddress?: GeoAddress | null;
    defaultError?: GeoReverseGeocodeError | null;
}
/**
 * Deterministic {@link ReverseGeocoder} for tests.
 *
 * @class MockReverseGeocoder
 * @since 1.2.6
 */
export declare class MockReverseGeocoder implements ReverseGeocoder {
    private readonly config;
    constructor(config?: MockReverseGeocoderConfig);
    reverseGeocode(latitude: number, longitude: number): Promise<GeoAddress>;
}
//# sourceMappingURL=MockReverseGeocoder.d.ts.map