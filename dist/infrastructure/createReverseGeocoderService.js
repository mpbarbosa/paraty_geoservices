"use strict";
/**
 * Composition helper for {@link ReverseGeocoderService}.
 *
 * Wires Nominatim and optional AWS adapters so application code does not
 * construct infrastructure types directly.
 *
 * @module infrastructure/createReverseGeocoderService
 * @since 1.2.6
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReverseGeocoderService = createReverseGeocoderService;
const ReverseGeocoder_1 = require("../application/services/ReverseGeocoder");
const AwsGeocoder_1 = require("./providers/AwsGeocoder");
const NominatimGeocoder_1 = require("./providers/NominatimGeocoder");
/**
 * Creates a fully wired reverse-geocoding orchestrator.
 *
 * @param fetchManager - Optional legacy fetch manager (IbiraAPIFetchManager).
 * @param config       - Provider URLs, CORS, and orchestrator options.
 */
function createReverseGeocoderService(fetchManager = null, config = {}) {
    const nominatimGeocoder = new NominatimGeocoder_1.NominatimGeocoder({
        nominatimApiUrl: config.nominatimApiUrl,
        openstreetmapBaseUrl: config.openstreetmapBaseUrl,
        corsProxy: config.corsProxy,
        enableCorsFallback: config.enableCorsFallback,
        legacyFetchManager: fetchManager,
    });
    const awsEnabled = config.awsLbsEnabled ?? false;
    const awsBaseUrl = config.awsLbsBaseUrl ?? '';
    const awsGeocoder = config.awsGeocoder ??
        (awsEnabled && awsBaseUrl ? new AwsGeocoder_1.AwsGeocoder(awsBaseUrl) : null);
    const options = {
        nominatimGeocoder,
        awsGeocoder,
        geocodingPrimaryProvider: config.geocodingPrimaryProvider,
        positionUpdateEvent: config.positionUpdateEvent,
        immediateAddressUpdateEvent: config.immediateAddressUpdateEvent,
        logger: config.logger,
        errorNotifier: config.errorNotifier,
        emitBrowserProviderEvents: config.emitBrowserProviderEvents,
    };
    return new ReverseGeocoder_1.ReverseGeocoder(options);
}
//# sourceMappingURL=createReverseGeocoderService.js.map