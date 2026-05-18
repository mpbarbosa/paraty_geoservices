/**
 * Reverse geocoding orchestrator: coordinates → address with observer notifications.
 *
 * **Naming:** Exported as `ReverseGeocoderService`. The domain port is
 * `ReverseGeocoder` in `src/domain/ports/ReverseGeocoder.ts`.
 *
 * Inject {@link ReverseGeocoder} adapters (Nominatim, AWS) via
 * {@link ReverseGeocoderServiceOptions}. Use
 * {@link createReverseGeocoderService} from infrastructure for default wiring.
 *
 * @module application/services/ReverseGeocoder
 * @since 1.6.0
 */

import { ObserverSubject } from '../ObserverSubject';
import { withObserver } from '../../utils/withObserver';
import type { GeoAddress } from '../../domain/entities/GeoAddress';
import type { ReverseGeocoder as ReverseGeocoderPort } from '../../domain/ports/ReverseGeocoder';
import type { ILogger } from './ChangeDetectionCoordinator';
import {
	ADDRESS_FETCHED_EVENT,
	GEOCODING_ERROR_EVENT,
	POSITION_UPDATE_EVENT,
	IMMEDIATE_ADDRESS_UPDATE_EVENT,
} from './reverseGeocoderEvents';

const defaultLogger: ILogger = {
	info: (message: string, ...args: unknown[]) => console.log(message, ...args),
	warn: (message: string, ...args: unknown[]) => console.warn(message, ...args),
	error: (message: string, ...args: unknown[]) => console.error(message, ...args),
};

/** User-visible error notification (optional; avoids direct `window` coupling). */
export interface ReverseGeocodeErrorNotifier {
	displayError(title: string, message: string): void;
}

/** Constructor options for {@link ReverseGeocoder}. */
export interface ReverseGeocoderServiceOptions {
	nominatimGeocoder: ReverseGeocoderPort;
	awsGeocoder?: ReverseGeocoderPort | null;
	geocodingPrimaryProvider?: 'aws' | 'nominatim';
	positionUpdateEvent?: string;
	immediateAddressUpdateEvent?: string;
	logger?: ILogger;
	errorNotifier?: ReverseGeocodeErrorNotifier | null;
	/** When true, dispatches browser `CustomEvent`s for provider UI (default: true in browsers). */
	emitBrowserProviderEvents?: boolean;
}

/** @deprecated Use {@link ReverseGeocoderServiceOptions}. Kept for factory config typing. */
export interface ReverseGeocoderConfig {
	nominatimGeocoder?: ReverseGeocoderPort | null;
	awsGeocoder?: ReverseGeocoderPort | null;
	nominatimApiUrl?: string;
	openstreetmapBaseUrl?: string;
	corsProxy?: string | null;
	enableCorsFallback?: boolean;
	geocodingPrimaryProvider?: 'aws' | 'nominatim';
	positionUpdateEvent?: string;
	immediateAddressUpdateEvent?: string;
	logger?: ILogger;
	errorNotifier?: ReverseGeocodeErrorNotifier | null;
	emitBrowserProviderEvents?: boolean;
}

/** Optional legacy Brazilian address normalizer (CDN AddressDataExtractor bridge). */
export interface BrazilianAddressNormalizer {
	getBrazilianStandardAddress(data: unknown): unknown;
}

function isValidCoordinate(value: number | null | undefined): value is number {
	return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Orchestrates reverse geocoding across injected providers and notifies observers.
 */
class ReverseGeocoder {
	latitude: number | null = null;
	longitude: number | null = null;
	/** Last Nominatim request URL when the nominatim adapter exposes it. */
	url: string | null = null;

	private readonly _nominatim: ReverseGeocoderPort;
	private readonly _aws: ReverseGeocoderPort | null;
	private _primaryProvider: 'aws' | 'nominatim';
	private readonly _positionUpdateEvent: string;
	private readonly _immediateAddressUpdateEvent: string;
	private readonly _logger: ILogger;
	private readonly _errorNotifier: ReverseGeocodeErrorNotifier | null;
	private readonly _emitBrowserEvents: boolean;

	observerSubject!: ObserverSubject;
	/** @deprecated Use {@link currentAddress}. */
	get data(): GeoAddress | null {
		return this.currentAddress;
	}
	set data(value: GeoAddress | null) {
		this.currentAddress = value;
	}
	currentAddress: GeoAddress | null = null;
	/** Standardized address passed as the second observer argument. */
	standardizedAddress: GeoAddress | unknown | null = null;
	/** @deprecated Use {@link standardizedAddress}. */
	get enderecoPadronizado(): GeoAddress | unknown | null {
		return this.standardizedAddress;
	}
	set enderecoPadronizado(value: GeoAddress | unknown | null) {
		this.standardizedAddress = value;
	}

	error: unknown = null;
	loading = false;
	lastFetch = 0;
	AddressDataExtractor: BrazilianAddressNormalizer | null = null;

	declare subscribe: (observer: unknown) => void;
	declare unsubscribe: (observer: unknown) => void;

	constructor(options: ReverseGeocoderServiceOptions) {
		this._nominatim = options.nominatimGeocoder;
		this._aws = options.awsGeocoder ?? null;
		this._primaryProvider =
			options.geocodingPrimaryProvider === 'nominatim' ? 'nominatim' : 'aws';
		this._positionUpdateEvent =
			options.positionUpdateEvent ?? POSITION_UPDATE_EVENT;
		this._immediateAddressUpdateEvent =
			options.immediateAddressUpdateEvent ?? IMMEDIATE_ADDRESS_UPDATE_EVENT;
		this._logger = options.logger ?? defaultLogger;
		this._errorNotifier = options.errorNotifier ?? null;
		this._emitBrowserEvents =
			options.emitBrowserProviderEvents ??
			(typeof globalThis !== 'undefined' &&
				typeof (globalThis as { window?: unknown }).window !== 'undefined');

		this.observerSubject = new ObserverSubject();
	}

	_subscribe(url: string): void {
		const nominatim = this._nominatim as {
			subscribeLegacyObservers?: (observers: unknown[], url: string) => void;
		};
		nominatim.subscribeLegacyObservers?.(
			this.observerSubject.observers,
			url,
		);
	}

	notifyObservers(...args: unknown[]): void {
		this._logger.info('(ReverseGeocoder) Notifying observers with args:', args);
		this.observerSubject.notifyObservers(...args);
	}

	secondUpdateParam(): GeoAddress | unknown | null {
		return this.standardizedAddress;
	}

	setCoordinates(latitude: number, longitude: number): void {
		if (!isValidCoordinate(latitude) || !isValidCoordinate(longitude)) {
			return;
		}

		this.latitude = latitude;
		this.longitude = longitude;

		const nominatimWithUrl = this._nominatim as {
			buildUrl?: (lat: number, lon: number) => string;
		};
		this.url = nominatimWithUrl.buildUrl
			? nominatimWithUrl.buildUrl.call(this._nominatim, latitude, longitude)
			: null;

		this.currentAddress = null;
		this.error = null;
		this.loading = false;
		this.lastFetch = 0;
	}

	getCacheKey(): string {
		return `${this.latitude},${this.longitude}`;
	}

	/**
	 * Resolves the current coordinates via the configured provider chain.
	 */
	async fetchAddress(): Promise<GeoAddress> {
		if (!isValidCoordinate(this.latitude) || !isValidCoordinate(this.longitude)) {
			throw new Error('Invalid coordinates');
		}

		const lat = this.latitude;
		const lon = this.longitude;
		const primaryIsAws = this._primaryProvider !== 'nominatim';

		if (primaryIsAws && this._aws) {
			try {
				return await this.completeWithAddress(
					await this._aws.reverseGeocode(lat, lon),
					'aws',
				);
			} catch (awsErr) {
				this._logger.warn(
					'(ReverseGeocoder.fetchAddress) AWS provider failed, falling back to Nominatim:',
					(awsErr as Error).message,
				);
			}
		}

		try {
			const address = await this._nominatim.reverseGeocode(lat, lon);
			this.syncUrlFromNominatim();
			if (this.url) {
				this._subscribe(this.url);
			}
			return await this.completeWithAddress(address, 'nominatim');
		} catch (err) {
			if (!primaryIsAws && this._aws) {
				try {
					return await this.completeWithAddress(
						await this._aws.reverseGeocode(lat, lon),
						'aws',
					);
				} catch (awsErr) {
					this._logger.warn(
						'(ReverseGeocoder.fetchAddress) AWS fallback also failed:',
						(awsErr as Error).message,
					);
				}
			}

			this.handleFetchError(err);
			throw err;
		}
	}

	private async completeWithAddress(
		geoAddress: GeoAddress,
		provider: 'aws' | 'nominatim',
	): Promise<GeoAddress> {
		this.currentAddress = geoAddress;
		this.standardizedAddress = this.resolveStandardizedAddress(geoAddress);
		this._dispatchProviderEvent(provider);
		this.notifyObservers(
			this.currentAddress,
			this.standardizedAddress,
			ADDRESS_FETCHED_EVENT,
			false,
			null,
		);
		return geoAddress;
	}

	private resolveStandardizedAddress(
		geoAddress: GeoAddress,
	): GeoAddress | unknown {
		if (this.AddressDataExtractor) {
			return this.AddressDataExtractor.getBrazilianStandardAddress(geoAddress);
		}
		return geoAddress;
	}

	private syncUrlFromNominatim(): void {
		const lastUrl = (
			this._nominatim as { lastRequestUrl?: string | null }
		).lastRequestUrl;
		if (lastUrl) {
			this.url = lastUrl;
		}
	}

	private handleFetchError(err: unknown): void {
		const message = err instanceof Error ? err.message : String(err);
		let errorMessage = 'Falha ao buscar endereço';
		let shouldNotifyUser = false;

		if (message.includes('CORS') || message.includes('Failed to fetch')) {
			errorMessage =
				'Não foi possível acessar o serviço de geocodificação. Verifique sua conexão.';
			shouldNotifyUser = true;
		} else if (message.includes('429')) {
			errorMessage =
				'Limite de requisições atingido. Aguarde alguns segundos e tente novamente.';
			shouldNotifyUser = true;
		} else if (message.includes('425')) {
			errorMessage =
				'Serviço temporariamente indisponível. Tente novamente em alguns segundos.';
			shouldNotifyUser = true;
		}

		this._logger.error('(ReverseGeocoder.fetchAddress) Failed:', err);

		if (shouldNotifyUser && this._errorNotifier) {
			this._errorNotifier.displayError('Erro de Rede', errorMessage);
		}

		this.error = err;
		this.notifyObservers(null, null, GEOCODING_ERROR_EVENT, false, err);
	}

	update(
		positionManager: unknown,
		posEvent: unknown,
		_loading: unknown,
		_errState: unknown,
	): void {
		this._logger.info(`(ReverseGeocoder) update() called with posEvent: ${posEvent}`);

		if (!positionManager || !(positionManager as { lastPosition?: unknown }).lastPosition) {
			this._logger.warn('(ReverseGeocoder) Invalid PositionManager or no last position.');
			return;
		}

		if (
			posEvent !== this._positionUpdateEvent &&
			posEvent !== this._immediateAddressUpdateEvent
		) {
			this._logger.info(
				`(ReverseGeocoder) Ignoring event: ${posEvent} - not a position update`,
			);
			return;
		}

		const pm = positionManager as {
			lastPosition: { coords: { latitude: number; longitude: number } };
		};
		const coords = pm.lastPosition.coords;

		if (
			isValidCoordinate(coords?.latitude) &&
			isValidCoordinate(coords?.longitude)
		) {
			this.setCoordinates(coords.latitude, coords.longitude);
			void this.fetchAddress()
				.then(() => {
					this._logger.info('(ReverseGeocoder.update) Geocoding completed successfully');
				})
				.catch((err: unknown) => {
					this._logger.error('(ReverseGeocoder.update) Geocoding failed:', err);
					this.error = err;
				});
		} else {
			this._logger.warn(
				'(ReverseGeocoder) Position update received without valid coordinates.',
				coords,
			);
		}
	}

	/** @deprecated Delegates to {@link fetchAddress}. */
	async reverseGeocode(): Promise<GeoAddress> {
		return this.fetchAddress();
	}

	toString(): string {
		if (!isValidCoordinate(this.latitude) || !isValidCoordinate(this.longitude)) {
			return `${this.constructor.name}: No coordinates set`;
		}
		return `${this.constructor.name}: ${this.latitude}, ${this.longitude}`;
	}

	switchProvider(provider: 'aws' | 'nominatim'): void {
		if (provider !== 'aws' && provider !== 'nominatim') {
			throw new Error(
				`(ReverseGeocoder) Unknown provider: "${provider}". Use 'aws' or 'nominatim'.`,
			);
		}
		if (this._primaryProvider === provider) {
			return;
		}

		this._logger.info(
			`(ReverseGeocoder) Switching primary provider: ${this._primaryProvider} → ${provider}`,
		);
		this._primaryProvider = provider;

		if (this._emitBrowserEvents && typeof window !== 'undefined') {
			window.dispatchEvent(
				new CustomEvent('geocoder-provider-changed', { detail: { provider } }),
			);
		}
	}

	hasAwsProvider(): boolean {
		return this._aws !== null;
	}

	getPrimaryProvider(): 'aws' | 'nominatim' {
		return this._primaryProvider;
	}

	private _dispatchProviderEvent(provider: 'aws' | 'nominatim'): void {
		if (!this._emitBrowserEvents || typeof window === 'undefined') {
			return;
		}
		window.dispatchEvent(
			new CustomEvent('geocoder-provider-used', { detail: { provider } }),
		);
	}
}

Object.assign(ReverseGeocoder.prototype, withObserver({ excludeNotify: true }));

export default ReverseGeocoder;
export { ReverseGeocoder };
