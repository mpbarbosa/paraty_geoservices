"use strict";
/**
 * OpenStreetMap Nominatim reverse geocoding adapter.
 *
 * @module infrastructure/providers/NominatimGeocoder
 * @since 1.2.6
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NominatimGeocoder = void 0;
const GeoReverseGeocodeError_1 = require("../../domain/entities/GeoReverseGeocodeError");
const NominatimAddressMapper_1 = require("./NominatimAddressMapper");
const DEFAULT_NOMINATIM_API = 'https://nominatim.openstreetmap.org';
const DEFAULT_CORS_PROXY = 'https://api.allorigins.win/raw?url=';
/**
 * Reverse geocoder for the OpenStreetMap Nominatim API.
 */
class NominatimGeocoder {
    constructor(config = {}) {
        this._corsRetryAttempted = false;
        this.lastRequestUrl = null;
        const nominatimBase = config.nominatimApiUrl ?? DEFAULT_NOMINATIM_API;
        this.baseUrl =
            config.openstreetmapBaseUrl ??
                `${nominatimBase}/reverse?format=json`;
        this.corsProxy = config.corsProxy ?? null;
        this.enableCorsFallback = config.enableCorsFallback ?? false;
        this.fetchFn = config.fetchFn ?? fetch;
        this.legacyFetchManager = config.legacyFetchManager ?? null;
    }
    buildUrl(latitude, longitude) {
        return (0, NominatimAddressMapper_1.buildNominatimReverseUrl)(latitude, longitude, this.baseUrl, this.corsProxy);
    }
    async reverseGeocode(latitude, longitude) {
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            throw (0, GeoReverseGeocodeError_1.createGeoReverseGeocodeError)(1, '(NominatimGeocoder) Invalid coordinates');
        }
        try {
            return await this.fetchAndMap(latitude, longitude);
        }
        catch (err) {
            if (this.shouldRetryWithCorsProxy(err)) {
                return this.retryWithCorsProxy(latitude, longitude);
            }
            throw err;
        }
    }
    async fetchAndMap(latitude, longitude) {
        const url = this.buildUrl(latitude, longitude);
        this.lastRequestUrl = url;
        const raw = await this.fetchRaw(url);
        return (0, NominatimAddressMapper_1.toGeoAddressFromNominatim)(raw);
    }
    async fetchRaw(url) {
        if (this.legacyFetchManager) {
            try {
                return await this.legacyFetchManager.fetch(url);
            }
            catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                throw (0, GeoReverseGeocodeError_1.createGeoReverseGeocodeError)(2, `(NominatimGeocoder) ${message}`);
            }
        }
        let response;
        try {
            response = await this.fetchFn(url);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            throw (0, GeoReverseGeocodeError_1.createGeoReverseGeocodeError)(2, `(NominatimGeocoder) Network error: ${message}`);
        }
        if (!response.ok) {
            throw (0, GeoReverseGeocodeError_1.createGeoReverseGeocodeError)(3, `(NominatimGeocoder) HTTP ${response.status}: ${response.statusText}`);
        }
        try {
            return await response.json();
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            throw (0, GeoReverseGeocodeError_1.createGeoReverseGeocodeError)(3, `(NominatimGeocoder) Invalid JSON: ${message}`);
        }
    }
    shouldRetryWithCorsProxy(err) {
        if (!this.enableCorsFallback || this._corsRetryAttempted) {
            return false;
        }
        const message = err instanceof Error ? err.message : String(err);
        return (message.includes('CORS') ||
            message.includes('Failed to fetch') ||
            message.includes('Network error'));
    }
    async retryWithCorsProxy(latitude, longitude) {
        this._corsRetryAttempted = true;
        const previousProxy = this.corsProxy;
        this.corsProxy = DEFAULT_CORS_PROXY;
        try {
            return await this.fetchAndMap(latitude, longitude);
        }
        finally {
            this.corsProxy = previousProxy;
            this._corsRetryAttempted = false;
        }
    }
    /** Subscribes legacy fetch-manager observers to the last built URL. */
    subscribeLegacyObservers(observers, url) {
        if (!this.legacyFetchManager) {
            return;
        }
        for (const observer of observers) {
            this.legacyFetchManager.subscribe(observer, url);
        }
    }
}
exports.NominatimGeocoder = NominatimGeocoder;
//# sourceMappingURL=NominatimGeocoder.js.map