/**
 * Composition helper for {@link ReverseGeocoderService}.
 *
 * Wires Nominatim and optional AWS adapters so application code does not
 * construct infrastructure types directly.
 *
 * @module infrastructure/createReverseGeocoderService
 * @since 1.2.6
 */
import { ReverseGeocoder as ReverseGeocoderService, type ReverseGeocoderConfig } from '../application/services/ReverseGeocoder';
import { type LegacyFetchManager } from './providers/NominatimGeocoder';
export type { LegacyFetchManager };
export interface CreateReverseGeocoderServiceConfig extends Omit<ReverseGeocoderConfig, 'nominatimGeocoder'> {
    awsLbsEnabled?: boolean;
    awsLbsBaseUrl?: string;
}
/**
 * Creates a fully wired reverse-geocoding orchestrator.
 *
 * @param fetchManager - Optional legacy fetch manager (IbiraAPIFetchManager).
 * @param config       - Provider URLs, CORS, and orchestrator options.
 */
export declare function createReverseGeocoderService(fetchManager?: LegacyFetchManager | null, config?: CreateReverseGeocoderServiceConfig): ReverseGeocoderService;
