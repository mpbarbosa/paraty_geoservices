"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsGeocoder = void 0;
const AwsAddressMapper_1 = require("./AwsAddressMapper");
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
class AwsGeocoder {
    constructor(baseUrl) {
        const resolvedBaseUrl = baseUrl ?? AwsGeocoder.resolveBaseUrlFromEnvironment();
        if (!resolvedBaseUrl) {
            throw new Error('AwsGeocoder requires a baseUrl or AWS_LBS_BASE_URL environment variable');
        }
        this.baseUrl = resolvedBaseUrl.replace(/\/+$/, '');
        this.endpoint = `${this.baseUrl}/api/geocode/reverse`;
    }
    /**
     * Performs reverse geocoding via the AWS Location Based Service.
     *
     * @param latitude  - Coordinate latitude.
     * @param longitude - Coordinate longitude.
     * @returns A provider-agnostic {@link GeoAddress} for the given coordinates.
     * @throws On invalid coordinates, network failure, or non-OK HTTP status.
     */
    async reverseGeocode(latitude, longitude) {
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            throw new Error('(AwsGeocoder) Invalid coordinates');
        }
        const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude, longitude }),
        });
        if (!response.ok) {
            throw new Error(`(AwsGeocoder) HTTP ${response.status}: ${response.statusText}`);
        }
        const rawData = (await response.json());
        return (0, AwsAddressMapper_1.toGeoAddress)(rawData);
    }
    static resolveBaseUrlFromEnvironment() {
        const processLike = globalThis;
        return processLike.process?.env?.AWS_LBS_BASE_URL;
    }
}
exports.AwsGeocoder = AwsGeocoder;
//# sourceMappingURL=AwsGeocoder.js.map