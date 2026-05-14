/**
 * Pure address-mapping helpers for the AWS reverse geocoding provider.
 *
 * All functions in this module are stateless and side-effect-free, making
 * them independently testable and reusable without instantiating AwsGeocoder.
 *
 * @module infrastructure/providers/AwsAddressMapper
 * @since 1.2.3
 * @author Marcelo Pereira Barbosa
 */
import type { GeoAddress } from '../../domain/entities/GeoAddress';
import type { AwsReverseGeocodeResponse } from './AwsGeocoder';
/**
 * Parses a label string from the AWS address response into a street name and
 * optional neighborhood.
 *
 * The label format is typically: `"Street [Number], Neighborhood, Municipality, PostalCode, Country"`.
 * This function strips the street number from the street name when present and
 * identifies the neighborhood candidate in the second label segment, skipping
 * segments that look like postal codes or are equal to the municipality name.
 *
 * @param label         - Raw label string from the AWS address response.
 * @param addressNumber - Street number to strip from the label, if any.
 * @param municipality  - Municipality name used to detect and skip that segment.
 * @returns Parsed `street` and `neighborhood` values (both may be `null`).
 */
export declare function parseLabel(label: unknown, addressNumber: unknown, municipality: unknown): {
    street: string | null;
    neighborhood: string | null;
};
/**
 * Resolves a Brazilian state full name to its two-letter abbreviation (sigla).
 *
 * Returns `null` when the region is absent, not a string, or not found in
 * the known state map.
 *
 * @param region - State full name (e.g., `"São Paulo"`).
 * @returns Two-letter code (e.g., `"SP"`), or `null`.
 */
export declare function resolveStateCode(region: unknown): string | null;
/**
 * Normalizes a country string to the canonical Portuguese name `"Brasil"`.
 *
 * Any of `"BRA"`, `"BR"`, `"Brasil"`, or `"Brazil"` are recognized as Brazil
 * and normalized. All other non-empty strings are returned unchanged. An empty
 * or absent value defaults to `"Brasil"`.
 *
 * @param country - Raw country value from the provider response.
 * @returns Normalized country name.
 */
export declare function normalizeCountry(country: unknown): string;
/**
 * Maps a raw AWS reverse geocode response to a {@link GeoAddress}.
 *
 * @param rawData - Raw response object from the AWS Location Service endpoint.
 * @returns A provider-agnostic {@link GeoAddress}.
 */
export declare function toGeoAddress(rawData: AwsReverseGeocodeResponse): GeoAddress;
