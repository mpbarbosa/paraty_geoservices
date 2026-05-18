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
 * @since 1.6.0
 * @author Marcelo Pereira Barbosa
 */
import { throttle } from '../../utils/throttle.js';
/** Default throttle interval: at most one position update per 5 seconds. */
const GEOLOCATION_THROTTLE_INTERVAL = 5000;
const DEFAULT_OPTIONS = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0,
};
function isGeolocationPermissionReader(value) {
    return typeof value.checkPermissions === 'function';
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
class GeolocationService {
    /**
     * Creates a new `GeolocationService`.
     *
     * @param provider - Geolocation provider to use.
     * @param config   - Optional configuration object.
     * @param config.geolocationOptions - Options forwarded to the provider (accuracy, timeout, etc.).
     * @param config.permissionReader - Optional collaborator used by `checkPermissions()`.
     */
    constructor(provider, config = {}) {
        if (!provider) {
            throw new TypeError('GeolocationService requires a GeolocationProvider instance');
        }
        this.watchId = null;
        this.isWatching = false;
        this.lastKnownPosition = null;
        this.isPendingRequest = false;
        this.pendingPromise = null;
        this.lastSingleFetchTime = 0;
        this._throttleInterval = GEOLOCATION_THROTTLE_INTERVAL;
        this._rawWatchHandler = (position) => {
            this.lastKnownPosition = position;
        };
        this.throttledWatchHandler = throttle(this._rawWatchHandler, this._throttleInterval);
        this.config = {
            geolocationOptions: config.geolocationOptions ?? DEFAULT_OPTIONS,
        };
        this.provider = provider;
        this.permissionReader =
            config.permissionReader ??
                (isGeolocationPermissionReader(provider) ? provider : null);
    }
    /**
     * Checks the current geolocation permission status using the Permissions API.
     *
     * Falls back to `'prompt'` when the Permissions API is unavailable or throws.
     *
     * @returns `'granted'`, `'denied'`, or `'prompt'`.
     */
    checkPermissions() {
        return this.permissionReader?.checkPermissions() ?? Promise.resolve('prompt');
    }
    _clearPendingState() {
        this.isPendingRequest = false;
        this.pendingPromise = null;
    }
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
    getSingleLocationUpdate() {
        if (this.isPendingRequest && this.pendingPromise) {
            return this.pendingPromise;
        }
        if (Date.now() - this.lastSingleFetchTime < this._throttleInterval &&
            this.lastKnownPosition) {
            return Promise.resolve(this.lastKnownPosition);
        }
        if (!this.provider.isSupported()) {
            const err = new Error('Geolocation is not supported by this browser');
            err.name = 'NotSupportedError';
            return Promise.reject(err);
        }
        this.isPendingRequest = true;
        this.pendingPromise = new Promise((resolve, reject) => {
            this.provider.getCurrentPosition((position) => {
                this._clearPendingState();
                this.lastKnownPosition = position;
                this.lastSingleFetchTime = Date.now();
                resolve(position);
            }, (err) => {
                // Timeout (code 3) with high accuracy: retry once at low accuracy
                if (err.code === 3 && this.config.geolocationOptions.enableHighAccuracy !== false) {
                    const fallbackOptions = {
                        ...this.config.geolocationOptions,
                        enableHighAccuracy: false,
                        timeout: 10000,
                    };
                    this.provider.getCurrentPosition((position) => {
                        this._clearPendingState();
                        this.lastKnownPosition = position;
                        this.lastSingleFetchTime = Date.now();
                        resolve(position);
                    }, (fallbackErr) => {
                        this._clearPendingState();
                        reject(fallbackErr);
                    }, fallbackOptions);
                    return;
                }
                this._clearPendingState();
                reject(err);
            }, this.config.geolocationOptions);
        });
        return this.pendingPromise;
    }
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
    watchCurrentLocation(onUpdate, onError) {
        if (!this.provider.isSupported()) {
            return null;
        }
        if (this.isWatching) {
            return this.watchId;
        }
        this._rawWatchHandler = (position) => {
            this.lastKnownPosition = position;
            onUpdate?.(position);
        };
        this.throttledWatchHandler = throttle(this._rawWatchHandler, this._throttleInterval);
        const watchId = this.provider.watchPosition((position) => this.throttledWatchHandler(position), (err) => {
            if (err.code === 3) {
                // Timeout is transient for a continuous watch; keep running
                return;
            }
            onError?.(err);
        }, this.config.geolocationOptions);
        this.watchId = watchId;
        this.isWatching = true;
        return this.watchId;
    }
    /**
     * Stops watching the position.
     *
     * Safe to call when no watch is active.
     */
    stopWatching() {
        if (this.watchId !== null && this.isWatching) {
            this.provider.clearWatch(this.watchId);
            this.watchId = null;
            this.isWatching = false;
        }
    }
    /** Returns the last position delivered by any method, or `null`. */
    getLastKnownPosition() {
        return this.lastKnownPosition;
    }
    /** Returns `true` if a position watch is currently active. */
    isCurrentlyWatching() {
        return this.isWatching;
    }
    /** Returns the active watch ID, or `null` when not watching. */
    getCurrentWatchId() {
        return this.watchId;
    }
    /** Returns `true` while a `getSingleLocationUpdate` call is in flight. */
    hasPendingRequest() {
        return this.isPendingRequest;
    }
    /**
     * Resets both throttle guards so the next position fetch and the next watch
     * callback both execute immediately, regardless of elapsed time.
     *
     * Use sparingly — for example when the user explicitly taps "refresh location".
     *
     * @since 1.6.0
     */
    flushThrottle() {
        this.lastSingleFetchTime = 0;
        this.throttledWatchHandler.flush();
    }
    /**
     * Replaces the active throttle with a new interval.
     *
     * The active `watchPosition` subscription is unaffected — only the rate at
     * which GPS events are forwarded changes.
     *
     * @param ms - New throttle interval in milliseconds.
     * @since 1.6.0
     */
    setThrottleInterval(ms) {
        this._throttleInterval = ms;
        this.throttledWatchHandler = throttle(this._rawWatchHandler, ms);
    }
}
export default GeolocationService;
export { GeolocationService };
