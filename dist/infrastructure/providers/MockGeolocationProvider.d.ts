/**
 * Mock geolocation provider for tests and deterministic local development.
 *
 * Concrete infrastructure adapter that implements the domain port without
 * relying on browser APIs. It can be configured to return a fixed position,
 * surface a fixed error, simulate async delays, and fan out watch updates to
 * multiple active subscribers.
 *
 * `watchPosition()` intentionally schedules an immediate callback with the
 * current configured position or error, making it convenient for tests that
 * need an initial emission without a real device.
 *
 * @module infrastructure/providers/MockGeolocationProvider
 * @since 1.2.1
 * @author Marcelo Pereira Barbosa
 */
import GeolocationProvider from '../../domain/ports/GeolocationProvider';
import type { GeoPosition } from '../../domain/entities/GeoPosition';
import type { GeoPositionError } from '../../domain/entities/GeoPositionError';
import type { GeoPositionOptions } from '../../domain/entities/GeoPositionOptions';
export interface MockGeolocationProviderConfig {
    supported?: boolean;
    defaultPosition?: GeoPosition | null;
    defaultError?: GeoPositionError | null;
    delay?: number;
}
/**
 * Mock implementation of the geolocation provider port.
 *
 * @class MockGeolocationProvider
 * @extends GeolocationProvider
 * @since 1.2.1
 */
export declare class MockGeolocationProvider extends GeolocationProvider {
    private config;
    private watchIdCounter;
    private readonly activeWatches;
    private readonly pendingTimeouts;
    constructor(config?: MockGeolocationProviderConfig);
    /** @inheritdoc */
    getCurrentPosition(successCallback: (pos: GeoPosition) => void, errorCallback: (err: GeoPositionError) => void, _options?: GeoPositionOptions): void;
    /** @inheritdoc */
    watchPosition(successCallback: (pos: GeoPosition) => void, errorCallback: (err: GeoPositionError) => void, _options?: GeoPositionOptions): number | null;
    /** @inheritdoc */
    clearWatch(watchId: number): void;
    /** @inheritdoc */
    isSupported(): boolean;
    /**
     * Mirrors the browser adapter helper for API parity in tests.
     *
     * @returns Always `false`, because the mock has no real Permissions API.
     */
    isPermissionsAPISupported(): boolean;
    /**
     * Sets the position returned by future calls and clears any configured error.
     *
     * @param position - Position to return.
     */
    setPosition(position: GeoPosition): void;
    /**
     * Sets the error returned by future calls and clears any configured position.
     *
     * @param error - Error to return.
     */
    setError(error: GeoPositionError): void;
    /**
     * Pushes a position update to all active watches.
     *
     * If no position is provided, the current configured default position is used.
     *
     * @param position - Optional position override for this update.
     */
    triggerWatchUpdate(position?: GeoPosition): void;
    /**
     * Pushes an error to all active watches.
     *
     * If no error is provided, the configured default error is used. When neither
     * exists, a target-compatible POSITION_UNAVAILABLE error is emitted.
     *
     * @param error - Optional error override for this update.
     */
    triggerWatchError(error?: GeoPositionError): void;
    /**
     * Clears all active watches and cancels scheduled callbacks.
     */
    destroy(): void;
    private scheduleCallback;
    private createUnsupportedError;
    private createPositionUnavailableError;
}
//# sourceMappingURL=MockGeolocationProvider.d.ts.map