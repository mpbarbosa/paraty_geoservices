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
import type { GeoAddress } from '../../domain/entities/GeoAddress';
import type { ReverseGeocoder as ReverseGeocoderPort } from '../../domain/ports/ReverseGeocoder';
import type { ILogger } from './ChangeDetectionCoordinator';
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
/**
 * Orchestrates reverse geocoding across injected providers and notifies observers.
 */
declare class ReverseGeocoder {
    latitude: number | null;
    longitude: number | null;
    /** Last Nominatim request URL when the nominatim adapter exposes it. */
    url: string | null;
    private readonly _nominatim;
    private readonly _aws;
    private _primaryProvider;
    private readonly _positionUpdateEvent;
    private readonly _immediateAddressUpdateEvent;
    private readonly _logger;
    private readonly _errorNotifier;
    private readonly _emitBrowserEvents;
    observerSubject: ObserverSubject;
    /** @deprecated Use {@link currentAddress}. */
    get data(): GeoAddress | null;
    set data(value: GeoAddress | null);
    currentAddress: GeoAddress | null;
    /** Standardized address passed as the second observer argument. */
    standardizedAddress: GeoAddress | unknown | null;
    /** @deprecated Use {@link standardizedAddress}. */
    get enderecoPadronizado(): GeoAddress | unknown | null;
    set enderecoPadronizado(value: GeoAddress | unknown | null);
    error: unknown;
    loading: boolean;
    lastFetch: number;
    AddressDataExtractor: BrazilianAddressNormalizer | null;
    subscribe: (observer: unknown) => void;
    unsubscribe: (observer: unknown) => void;
    constructor(options: ReverseGeocoderServiceOptions);
    _subscribe(url: string): void;
    notifyObservers(...args: unknown[]): void;
    secondUpdateParam(): GeoAddress | unknown | null;
    setCoordinates(latitude: number, longitude: number): void;
    getCacheKey(): string;
    /**
     * Resolves the current coordinates via the configured provider chain.
     */
    fetchAddress(): Promise<GeoAddress>;
    private completeWithAddress;
    private resolveStandardizedAddress;
    private syncUrlFromNominatim;
    private handleFetchError;
    update(positionManager: unknown, posEvent: unknown, _loading: unknown, _errState: unknown): void;
    /** @deprecated Delegates to {@link fetchAddress}. */
    reverseGeocode(): Promise<GeoAddress>;
    toString(): string;
    switchProvider(provider: 'aws' | 'nominatim'): void;
    hasAwsProvider(): boolean;
    getPrimaryProvider(): 'aws' | 'nominatim';
    private _dispatchProviderEvent;
}
export default ReverseGeocoder;
export { ReverseGeocoder };
