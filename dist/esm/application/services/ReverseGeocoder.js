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
import { ADDRESS_FETCHED_EVENT, GEOCODING_ERROR_EVENT, POSITION_UPDATE_EVENT, IMMEDIATE_ADDRESS_UPDATE_EVENT, } from './reverseGeocoderEvents';
const defaultLogger = {
    info: (message, ...args) => console.log(message, ...args),
    warn: (message, ...args) => console.warn(message, ...args),
    error: (message, ...args) => console.error(message, ...args),
};
function isValidCoordinate(value) {
    return typeof value === 'number' && Number.isFinite(value);
}
/**
 * Orchestrates reverse geocoding across injected providers and notifies observers.
 */
class ReverseGeocoder {
    /** @deprecated Use {@link currentAddress}. */
    get data() {
        return this.currentAddress;
    }
    set data(value) {
        this.currentAddress = value;
    }
    /** @deprecated Use {@link standardizedAddress}. */
    get enderecoPadronizado() {
        return this.standardizedAddress;
    }
    set enderecoPadronizado(value) {
        this.standardizedAddress = value;
    }
    constructor(options) {
        this.latitude = null;
        this.longitude = null;
        /** Last Nominatim request URL when the nominatim adapter exposes it. */
        this.url = null;
        this.currentAddress = null;
        /** Standardized address passed as the second observer argument. */
        this.standardizedAddress = null;
        this.error = null;
        this.loading = false;
        this.lastFetch = 0;
        this.AddressDataExtractor = null;
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
                    typeof globalThis.window !== 'undefined');
        this.observerSubject = new ObserverSubject();
    }
    _subscribe(url) {
        const nominatim = this._nominatim;
        nominatim.subscribeLegacyObservers?.(this.observerSubject.observers, url);
    }
    notifyObservers(...args) {
        this._logger.info('(ReverseGeocoder) Notifying observers with args:', args);
        this.observerSubject.notifyObservers(...args);
    }
    secondUpdateParam() {
        return this.standardizedAddress;
    }
    setCoordinates(latitude, longitude) {
        if (!isValidCoordinate(latitude) || !isValidCoordinate(longitude)) {
            return;
        }
        this.latitude = latitude;
        this.longitude = longitude;
        const nominatimWithUrl = this._nominatim;
        this.url = nominatimWithUrl.buildUrl
            ? nominatimWithUrl.buildUrl.call(this._nominatim, latitude, longitude)
            : null;
        this.currentAddress = null;
        this.error = null;
        this.loading = false;
        this.lastFetch = 0;
    }
    getCacheKey() {
        return `${this.latitude},${this.longitude}`;
    }
    /**
     * Resolves the current coordinates via the configured provider chain.
     */
    async fetchAddress() {
        if (!isValidCoordinate(this.latitude) || !isValidCoordinate(this.longitude)) {
            throw new Error('Invalid coordinates');
        }
        const lat = this.latitude;
        const lon = this.longitude;
        const primaryIsAws = this._primaryProvider !== 'nominatim';
        if (primaryIsAws && this._aws) {
            try {
                return await this.completeWithAddress(await this._aws.reverseGeocode(lat, lon), 'aws');
            }
            catch (awsErr) {
                this._logger.warn('(ReverseGeocoder.fetchAddress) AWS provider failed, falling back to Nominatim:', awsErr.message);
            }
        }
        try {
            const address = await this._nominatim.reverseGeocode(lat, lon);
            this.syncUrlFromNominatim();
            if (this.url) {
                this._subscribe(this.url);
            }
            return await this.completeWithAddress(address, 'nominatim');
        }
        catch (err) {
            if (!primaryIsAws && this._aws) {
                try {
                    return await this.completeWithAddress(await this._aws.reverseGeocode(lat, lon), 'aws');
                }
                catch (awsErr) {
                    this._logger.warn('(ReverseGeocoder.fetchAddress) AWS fallback also failed:', awsErr.message);
                }
            }
            this.handleFetchError(err);
            throw err;
        }
    }
    async completeWithAddress(geoAddress, provider) {
        this.currentAddress = geoAddress;
        this.standardizedAddress = this.resolveStandardizedAddress(geoAddress);
        this._dispatchProviderEvent(provider);
        this.notifyObservers(this.currentAddress, this.standardizedAddress, ADDRESS_FETCHED_EVENT, false, null);
        return geoAddress;
    }
    resolveStandardizedAddress(geoAddress) {
        if (this.AddressDataExtractor) {
            return this.AddressDataExtractor.getBrazilianStandardAddress(geoAddress);
        }
        return geoAddress;
    }
    syncUrlFromNominatim() {
        const lastUrl = this._nominatim.lastRequestUrl;
        if (lastUrl) {
            this.url = lastUrl;
        }
    }
    handleFetchError(err) {
        const message = err instanceof Error ? err.message : String(err);
        let errorMessage = 'Falha ao buscar endereço';
        let shouldNotifyUser = false;
        if (message.includes('CORS') || message.includes('Failed to fetch')) {
            errorMessage =
                'Não foi possível acessar o serviço de geocodificação. Verifique sua conexão.';
            shouldNotifyUser = true;
        }
        else if (message.includes('429')) {
            errorMessage =
                'Limite de requisições atingido. Aguarde alguns segundos e tente novamente.';
            shouldNotifyUser = true;
        }
        else if (message.includes('425')) {
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
    update(positionManager, posEvent, _loading, _errState) {
        this._logger.info(`(ReverseGeocoder) update() called with posEvent: ${posEvent}`);
        if (!positionManager || !positionManager.lastPosition) {
            this._logger.warn('(ReverseGeocoder) Invalid PositionManager or no last position.');
            return;
        }
        if (posEvent !== this._positionUpdateEvent &&
            posEvent !== this._immediateAddressUpdateEvent) {
            this._logger.info(`(ReverseGeocoder) Ignoring event: ${posEvent} - not a position update`);
            return;
        }
        const pm = positionManager;
        const coords = pm.lastPosition.coords;
        if (isValidCoordinate(coords?.latitude) &&
            isValidCoordinate(coords?.longitude)) {
            this.setCoordinates(coords.latitude, coords.longitude);
            void this.fetchAddress()
                .then(() => {
                this._logger.info('(ReverseGeocoder.update) Geocoding completed successfully');
            })
                .catch((err) => {
                this._logger.error('(ReverseGeocoder.update) Geocoding failed:', err);
                this.error = err;
            });
        }
        else {
            this._logger.warn('(ReverseGeocoder) Position update received without valid coordinates.', coords);
        }
    }
    /** @deprecated Delegates to {@link fetchAddress}. */
    async reverseGeocode() {
        return this.fetchAddress();
    }
    toString() {
        if (!isValidCoordinate(this.latitude) || !isValidCoordinate(this.longitude)) {
            return `${this.constructor.name}: No coordinates set`;
        }
        return `${this.constructor.name}: ${this.latitude}, ${this.longitude}`;
    }
    switchProvider(provider) {
        if (provider !== 'aws' && provider !== 'nominatim') {
            throw new Error(`(ReverseGeocoder) Unknown provider: "${provider}". Use 'aws' or 'nominatim'.`);
        }
        if (this._primaryProvider === provider) {
            return;
        }
        this._logger.info(`(ReverseGeocoder) Switching primary provider: ${this._primaryProvider} → ${provider}`);
        this._primaryProvider = provider;
        if (this._emitBrowserEvents && typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('geocoder-provider-changed', { detail: { provider } }));
        }
    }
    hasAwsProvider() {
        return this._aws !== null;
    }
    getPrimaryProvider() {
        return this._primaryProvider;
    }
    _dispatchProviderEvent(provider) {
        if (!this._emitBrowserEvents || typeof window === 'undefined') {
            return;
        }
        window.dispatchEvent(new CustomEvent('geocoder-provider-used', { detail: { provider } }));
    }
}
Object.assign(ReverseGeocoder.prototype, withObserver({ excludeNotify: true }));
export default ReverseGeocoder;
export { ReverseGeocoder };
