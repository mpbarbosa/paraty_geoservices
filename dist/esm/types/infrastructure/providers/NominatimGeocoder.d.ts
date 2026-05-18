/**
 * OpenStreetMap Nominatim reverse geocoding adapter.
 *
 * @module infrastructure/providers/NominatimGeocoder
 * @since 1.2.6
 */
import type { GeoAddress } from '../../domain/entities/GeoAddress';
import type { ReverseGeocoder } from '../../domain/ports/ReverseGeocoder';
/** Legacy fetch manager used by ported guia_js integrations. */
export interface LegacyFetchManager {
    fetch(url: string): Promise<unknown>;
    subscribe(observer: unknown, url: string): void;
    observers?: unknown[];
}
export interface NominatimGeocoderConfig {
    nominatimApiUrl?: string;
    openstreetmapBaseUrl?: string;
    corsProxy?: string | null;
    enableCorsFallback?: boolean;
    fetchFn?: typeof fetch;
    legacyFetchManager?: LegacyFetchManager | null;
}
/**
 * Reverse geocoder for the OpenStreetMap Nominatim API.
 */
export declare class NominatimGeocoder implements ReverseGeocoder {
    readonly baseUrl: string;
    private corsProxy;
    private readonly enableCorsFallback;
    private readonly fetchFn;
    private readonly legacyFetchManager;
    private _corsRetryAttempted;
    lastRequestUrl: string | null;
    constructor(config?: NominatimGeocoderConfig);
    buildUrl(latitude: number, longitude: number): string;
    reverseGeocode(latitude: number, longitude: number): Promise<GeoAddress>;
    private fetchAndMap;
    private fetchRaw;
    private shouldRetryWithCorsProxy;
    private retryWithCorsProxy;
    /** Subscribes legacy fetch-manager observers to the last built URL. */
    subscribeLegacyObservers(observers: unknown[], url: string): void;
}
