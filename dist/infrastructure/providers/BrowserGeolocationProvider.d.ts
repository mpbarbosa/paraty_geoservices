/**
 * Browser-based geolocation provider.
 *
 * Concrete infrastructure adapter that delegates to the Web Geolocation API
 * (`navigator.geolocation`). Intended for browser environments, but supports
 * dependency injection of a navigator object for tests and custom runtimes.
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
import type { GeoPosition } from '../../domain/entities/GeoPosition';
import type { GeoPositionError } from '../../domain/entities/GeoPositionError';
import type { GeoPositionOptions } from '../../domain/entities/GeoPositionOptions';
export declare class BrowserGeolocationProvider extends GeolocationProvider {
    private readonly injectedNavigator;
    private readonly useGlobalNavigator;
    constructor(navigatorObj?: Navigator | null);
    private resolveNavigator;
    /** @inheritdoc */
    getCurrentPosition(successCallback: (pos: GeoPosition) => void, errorCallback: (err: GeoPositionError) => void, options?: GeoPositionOptions): void;
    /** @inheritdoc */
    watchPosition(successCallback: (pos: GeoPosition) => void, errorCallback: (err: GeoPositionError) => void, options?: GeoPositionOptions): number | null;
    /** @inheritdoc */
    clearWatch(watchId: number): void;
    /** @inheritdoc */
    isSupported(): boolean;
    isPermissionsAPISupported(): boolean;
    getNavigator(): Navigator | null;
}
//# sourceMappingURL=BrowserGeolocationProvider.d.ts.map