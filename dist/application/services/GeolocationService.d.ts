/**
 * High-level geolocation façade with throttling and race-condition protection.
 *
 * Wraps a {@link GeolocationProvider} and adds:
 * - Leading-edge throttle on watch callbacks (configurable via {@link GeolocationService.setThrottleInterval})
 * - Race-condition guard for single-shot requests ({@link GeolocationService.hasPendingRequest})
 * - Automatic low-accuracy retry on GPS timeout (error code 3)
 *
 * Works alongside {@link GetCurrentPositionUseCase} and {@link WatchPositionUseCase} — use
 * those when you need a minimal, one-concern wrapper; use this service when you need the
 * combined, rate-limited façade.
 *
 * @module application/services/GeolocationService
 * @since 1.5.0
 * @author Marcelo Pereira Barbosa
 */
import { GeolocationProvider } from '../../domain/ports/GeolocationProvider';
import type { GeolocationPermissionReader, GeolocationPermissionState } from '../../domain/ports/GeolocationPermissionReader';
import type { GeoPosition } from '../../domain/entities/GeoPosition';
import type { GeoPositionError } from '../../domain/entities/GeoPositionError';
import type { GeoPositionOptions } from '../../domain/entities/GeoPositionOptions';
export interface GeolocationServiceConfig {
    geolocationOptions?: GeoPositionOptions;
    permissionReader?: GeolocationPermissionReader;
}
/**
 * High-level geolocation façade.
 *
 * **Constructor injection:**
 * Pass any `GeolocationProvider` instance — `BrowserGeolocationProvider`,
 * `MockGeolocationProvider`, or a custom adapter.
 *
 * @class GeolocationService
 *
 * @example
 * // Browser usage
 * const provider = new BrowserGeolocationProvider();
 * const service = new GeolocationService(provider);
 * const position = await service.getSingleLocationUpdate();
 *
 * @example
 * // Injected mock for tests
 * const provider = new MockGeolocationProvider({ defaultPosition: mockPos });
 * const service = new GeolocationService(provider);
 */
declare class GeolocationService {
    private watchId;
    private isWatching;
    private lastKnownPosition;
    private isPendingRequest;
    private pendingPromise;
    private lastSingleFetchTime;
    /**
     * Leading-edge throttled wrapper around the watch callback.
     * Fires at most once per `_throttleInterval` ms; call `flushThrottle()` to reset.
     */
    private throttledWatchHandler;
    private _rawWatchHandler;
    private _throttleInterval;
    private config;
    private permissionReader;
    private provider;
    /**
     * Creates a new `GeolocationService`.
     *
     * @param provider - Geolocation provider to use.
     * @param config   - Optional configuration object.
     * @param config.geolocationOptions - Options forwarded to the provider (accuracy, timeout, etc.).
     * @param config.permissionReader - Optional collaborator used by `checkPermissions()`.
     */
    constructor(provider: GeolocationProvider, config?: GeolocationServiceConfig);
    /**
     * Checks the current geolocation permission status using the Permissions API.
     *
     * Falls back to `'prompt'` when the Permissions API is unavailable or throws.
     *
     * @returns `'granted'`, `'denied'`, or `'prompt'`.
     */
    checkPermissions(): Promise<GeolocationPermissionState>;
    private _clearPendingState;
    /**
     * Gets a single location update.
     *
     * - Returns the same pending `Promise` when called concurrently.
     * - Returns the cached position without a new GPS call when within the throttle window.
     * - Retries automatically with low accuracy when a high-accuracy request times out.
     *
     * @returns Resolves with the acquired `GeoPosition`.
     * @throws `GeoPositionError` on permission denial, position unavailability, or timeout.
     * @throws `Error` (`name: 'NotSupportedError'`) when geolocation is unavailable.
     */
    getSingleLocationUpdate(): Promise<GeoPosition>;
    /**
     * Starts watching the position for continuous updates.
     *
     * The `onUpdate` callback is throttled: it fires at most once per
     * `_throttleInterval` ms (default 5 s). Call `flushThrottle()` to
     * force-deliver the next update regardless of the cooldown.
     *
     * Timeout errors (code 3) from the watch are silently swallowed — the watch
     * keeps running and delivers a fix once the device acquires one.
     *
     * @param onUpdate - Invoked on each (throttled) position fix.
     * @param onError  - Invoked on non-transient errors (permission denied, unavailable).
     * @returns The watch ID, or `null` when geolocation is unsupported.
     */
    watchCurrentLocation(onUpdate?: (position: GeoPosition) => void, onError?: (error: GeoPositionError) => void): number | null;
    /**
     * Stops watching the position.
     *
     * Safe to call when no watch is active.
     */
    stopWatching(): void;
    /** Returns the last position delivered by any method, or `null`. */
    getLastKnownPosition(): GeoPosition | null;
    /** Returns `true` if a position watch is currently active. */
    isCurrentlyWatching(): boolean;
    /** Returns the active watch ID, or `null` when not watching. */
    getCurrentWatchId(): number | null;
    /** Returns `true` while a `getSingleLocationUpdate` call is in flight. */
    hasPendingRequest(): boolean;
    /**
     * Resets both throttle guards so the next position fetch and the next watch
     * callback both execute immediately, regardless of elapsed time.
     *
     * Use sparingly — for example when the user explicitly taps "refresh location".
     *
     * @since 1.5.0
     */
    flushThrottle(): void;
    /**
     * Replaces the active throttle with a new interval.
     *
     * The active `watchPosition` subscription is unaffected — only the rate at
     * which GPS events are forwarded changes.
     *
     * @param ms - New throttle interval in milliseconds.
     * @since 1.5.0
     */
    setThrottleInterval(ms: number): void;
}
export default GeolocationService;
export { GeolocationService };
//# sourceMappingURL=GeolocationService.d.ts.map