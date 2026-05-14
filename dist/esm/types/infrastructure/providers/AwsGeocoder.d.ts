/**
 * AWS reverse geocoding provider.
 *
 * Concrete infrastructure adapter that calls an AWS Location Service-compatible
 * reverse-geocoding endpoint and returns a provider-agnostic {@link GeoAddress}.
 *
 * Address-mapping logic is delegated to {@link AwsAddressMapper}, keeping this
 * class focused on HTTP orchestration only.
 *
 * @module infrastructure/providers/AwsGeocoder
 * @since 1.2.2
 * @author Marcelo Pereira Barbosa
 */
import type { GeoAddress } from '../../domain/entities/GeoAddress';
import type { ReverseGeocoder } from '../../domain/ports/ReverseGeocoder';
/**
 * Shape of a single address entry returned by the AWS Location Service API.
 *
 * This is the raw provider shape. Application code should use {@link GeoAddress}
 * instead of consuming this type directly.
 *
 * @since 1.2.2
 */
export interface AwsAddress {
    label?: string;
    addressNumber?: string;
    street?: string;
    neighborhood?: string;
    municipality?: string;
    region?: string;
    postalCode?: string;
    country?: string;
    interpolated?: boolean;
    [key: string]: unknown;
}
/**
 * Top-level response envelope returned by the AWS Location Service
 * reverse-geocoding endpoint.
 *
 * This is the raw provider shape. Application code should use {@link GeoAddress}
 * instead of consuming this type directly.
 *
 * @since 1.2.2
 */
export interface AwsReverseGeocodeResponse {
    provider?: string;
    coordinates?: {
        latitude?: number;
        longitude?: number;
    };
    address?: AwsAddress;
    geometry?: {
        Point?: [number, number];
        [key: string]: unknown;
    };
    [key: string]: unknown;
}
/**
 * Reverse geocoder that calls an AWS Location Service-compatible API.
 *
 * Implements the {@link ReverseGeocoder} port, making it injectable wherever
 * that interface is required.
 *
 * When no `baseUrl` is provided, the constructor falls back to the
 * `AWS_LBS_BASE_URL` environment variable.
 *
 * @class AwsGeocoder
 * @since 1.2.2
 */
export declare class AwsGeocoder implements ReverseGeocoder {
    readonly baseUrl: string;
    readonly endpoint: string;
    constructor(baseUrl?: string);
    /**
     * Performs reverse geocoding via the AWS Location Based Service.
     *
     * @param latitude  - Coordinate latitude.
     * @param longitude - Coordinate longitude.
     * @returns A provider-agnostic {@link GeoAddress} for the given coordinates.
     * @throws On invalid coordinates, network failure, or non-OK HTTP status.
     */
    reverseGeocode(latitude: number, longitude: number): Promise<GeoAddress>;
    private static resolveBaseUrlFromEnvironment;
}
