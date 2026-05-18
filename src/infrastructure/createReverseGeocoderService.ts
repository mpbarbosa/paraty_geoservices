/**
 * Composition helper for {@link ReverseGeocoderService}.
 *
 * Wires Nominatim and optional AWS adapters so application code does not
 * construct infrastructure types directly.
 *
 * @module infrastructure/createReverseGeocoderService
 * @since 1.2.6
 */

import {
	ReverseGeocoder as ReverseGeocoderService,
	type ReverseGeocoderConfig,
	type ReverseGeocoderServiceOptions,
} from '../application/services/ReverseGeocoder';
import { AwsGeocoder } from './providers/AwsGeocoder';
import {
	NominatimGeocoder,
	type LegacyFetchManager,
} from './providers/NominatimGeocoder';

export type { LegacyFetchManager };

export interface CreateReverseGeocoderServiceConfig
	extends Omit<ReverseGeocoderConfig, 'nominatimGeocoder'> {
	awsLbsEnabled?: boolean;
	awsLbsBaseUrl?: string;
}

/**
 * Creates a fully wired reverse-geocoding orchestrator.
 *
 * @param fetchManager - Optional legacy fetch manager (IbiraAPIFetchManager).
 * @param config       - Provider URLs, CORS, and orchestrator options.
 */
export function createReverseGeocoderService(
	fetchManager: LegacyFetchManager | null = null,
	config: CreateReverseGeocoderServiceConfig = {},
): ReverseGeocoderService {
	const nominatimGeocoder = new NominatimGeocoder({
		nominatimApiUrl: config.nominatimApiUrl,
		openstreetmapBaseUrl: config.openstreetmapBaseUrl,
		corsProxy: config.corsProxy,
		enableCorsFallback: config.enableCorsFallback,
		legacyFetchManager: fetchManager,
	});

	const awsEnabled = config.awsLbsEnabled ?? false;
	const awsBaseUrl = config.awsLbsBaseUrl ?? '';
	const awsGeocoder =
		config.awsGeocoder ??
		(awsEnabled && awsBaseUrl ? new AwsGeocoder(awsBaseUrl) : null);

	const options: ReverseGeocoderServiceOptions = {
		nominatimGeocoder,
		awsGeocoder,
		geocodingPrimaryProvider: config.geocodingPrimaryProvider,
		positionUpdateEvent: config.positionUpdateEvent,
		immediateAddressUpdateEvent: config.immediateAddressUpdateEvent,
		logger: config.logger,
		errorNotifier: config.errorNotifier,
		emitBrowserProviderEvents: config.emitBrowserProviderEvents,
	};

	return new ReverseGeocoderService(options);
}
