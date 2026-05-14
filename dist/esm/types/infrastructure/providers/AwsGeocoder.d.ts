/**
 * AWS reverse geocoding provider.
 *
 * Concrete infrastructure adapter that calls an AWS Location Service-compatible
 * reverse-geocoding endpoint and returns both the raw response and a
 * standardized Brazilian address shape.
 *
 * @module infrastructure/providers/AwsGeocoder
 * @since 1.2.2
 * @author Marcelo Pereira Barbosa
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
export interface BrazilianStandardAddress {
    logradouro: string | null;
    numero: string | null;
    complemento: string | null;
    bairro: string | null;
    municipio: string | null;
    regiaoMetropolitana: string | null;
    uf: string | null;
    siglaUF: string | null;
    cep: string | null;
    pais: string;
}
export interface AwsReverseGeocodeResult {
    rawData: AwsReverseGeocodeResponse;
    enderecoPadronizado: BrazilianStandardAddress;
}
/**
 * Reverse geocoder that calls an AWS Location Service-compatible API.
 *
 * When no `baseUrl` is provided, the constructor falls back to the
 * `AWS_LBS_BASE_URL` environment variable.
 *
 * @class AwsGeocoder
 * @since 1.2.2
 */
export declare class AwsGeocoder {
    readonly baseUrl: string;
    readonly endpoint: string;
    constructor(baseUrl?: string);
    /**
     * Performs reverse geocoding via the AWS Location Based Service.
     *
     * @param latitude - Coordinate latitude.
     * @param longitude - Coordinate longitude.
     * @returns Raw AWS response plus a standardized Brazilian address.
     * @throws On invalid coordinates, network failure, or non-OK HTTP status.
     */
    reverseGeocode(latitude: number, longitude: number): Promise<AwsReverseGeocodeResult>;
    private static resolveBaseUrlFromEnvironment;
    private static toBrazilianStandardAddress;
    private static parseLabel;
    private static resolveStateSigla;
    private static normalizeCountry;
}
