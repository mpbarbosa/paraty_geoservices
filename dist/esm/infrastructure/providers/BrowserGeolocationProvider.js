/**
 * Browser-based geolocation provider.
 *
 * Concrete infrastructure adapter that delegates to the Web Geolocation API
 * (navigator.geolocation). Intended for browser environments only.
 *
 * NOTE: This file is an infrastructure adapter — it lives outside the domain
 * and application layers and depends on the browser runtime. Do not import it
 * in domain or application code.
 *
 * @module infrastructure/providers/BrowserGeolocationProvider
 * @since 1.0.2
 * @author Marcelo Pereira Barbosa
 */
import GeolocationProvider from '../../domain/ports/GeolocationProvider';
export class BrowserGeolocationProvider extends GeolocationProvider {
    /** @inheritdoc */
    getCurrentPosition(successCallback, errorCallback, options) {
        navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
    }
    /** @inheritdoc */
    watchPosition(successCallback, errorCallback, options) {
        return navigator.geolocation.watchPosition(successCallback, errorCallback, options);
    }
    /** @inheritdoc */
    clearWatch(watchId) {
        navigator.geolocation.clearWatch(watchId);
    }
    /** @inheritdoc */
    isSupported() {
        return typeof navigator !== 'undefined' && 'geolocation' in navigator;
    }
}
