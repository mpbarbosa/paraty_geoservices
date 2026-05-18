/**
 * Pure address-mapping helpers for OpenStreetMap Nominatim reverse geocoding.
 *
 * @module infrastructure/providers/NominatimAddressMapper
 * @since 1.2.6
 */
import type { GeoAddress } from '../../domain/entities/GeoAddress';
/** Raw `address` object inside a Nominatim reverse-geocode JSON response. */
export interface NominatimAddressFields {
    road?: string;
    house_number?: string;
    suburb?: string;
    neighbourhood?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    region?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
    [key: string]: unknown;
}
/** Top-level Nominatim reverse-geocode JSON response. */
export interface NominatimReverseResponse {
    display_name?: string;
    address?: NominatimAddressFields;
    [key: string]: unknown;
}
/**
 * Builds a Nominatim reverse-geocode request URL.
 */
export declare function buildNominatimReverseUrl(latitude: number, longitude: number, baseUrl: string, corsProxy?: string | null): string;
/**
 * Maps a Nominatim reverse response to {@link GeoAddress}.
 */
export declare function toGeoAddressFromNominatim(raw: NominatimReverseResponse | null | undefined): GeoAddress;
//# sourceMappingURL=NominatimAddressMapper.d.ts.map