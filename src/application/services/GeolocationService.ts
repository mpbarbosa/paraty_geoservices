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
 * @since 1.3.0
 * @author Marcelo Pereira Barbosa
 */

import { GeolocationProvider } from '../../domain/ports/GeolocationProvider';
import type { GeoPosition } from '../../domain/entities/GeoPosition';
import type { GeoPositionError } from '../../domain/entities/GeoPositionError';
import type { GeoPositionOptions } from '../../domain/entities/GeoPositionOptions';
import { BrowserGeolocationProvider } from '../../infrastructure/providers/BrowserGeolocationProvider';
import { throttle } from '../../utils/throttle';
import type { ThrottledFunction } from '../../utils/throttle';

/** Default throttle interval: at most one position update per 5 seconds. */
const GEOLOCATION_THROTTLE_INTERVAL = 5_000;

const DEFAULT_OPTIONS: GeoPositionOptions = {
	enableHighAccuracy: true,
	timeout: 15_000,
	maximumAge: 0,
};

/** Minimal interface for providers that expose navigator access. */
interface NavigatorAccessor {
	getNavigator?(): Navigator | null;
}

/**
 * High-level geolocation façade.
 *
 * **Constructor injection:**
 * Pass any `GeolocationProvider` instance — `BrowserGeolocationProvider`,
 * `MockGeolocationProvider`, or a custom adapter. When omitted, a default
 * `BrowserGeolocationProvider` backed by the global `navigator` is used.
 *
 * @class GeolocationService
 *
 * @example
 * // Browser usage
 * const service = new GeolocationService();
 * const position = await service.getSingleLocationUpdate();
 *
 * @example
 * // Injected mock for tests
 * const provider = new MockGeolocationProvider({ defaultPosition: mockPos });
 * const service = new GeolocationService(provider);
 */
class GeolocationService {
	private watchId: number | null;
	private isWatching: boolean;
	private lastKnownPosition: GeoPosition | null;
	private isPendingRequest: boolean;
	private pendingPromise: Promise<GeoPosition> | null;
	private lastSingleFetchTime: number;
	/**
	 * Leading-edge throttled wrapper around the watch callback.
	 * Fires at most once per `_throttleInterval` ms; call `flushThrottle()` to reset.
	 */
	private throttledWatchHandler: ThrottledFunction<[GeoPosition], void>;
	private _rawWatchHandler: (position: GeoPosition) => void;
	private _throttleInterval: number;
	private config: { geolocationOptions: GeoPositionOptions };
	private provider: GeolocationProvider;

	/**
	 * Creates a new `GeolocationService`.
	 *
	 * @param provider - Geolocation provider to use. Defaults to `BrowserGeolocationProvider`.
	 * @param config   - Optional configuration object.
	 * @param config.geolocationOptions - Options forwarded to the provider (accuracy, timeout, etc.).
	 */
	constructor(
		provider?: GeolocationProvider | null,
		config: { geolocationOptions?: GeoPositionOptions } = {},
	) {
		this.watchId = null;
		this.isWatching = false;
		this.lastKnownPosition = null;
		this.isPendingRequest = false;
		this.pendingPromise = null;
		this.lastSingleFetchTime = 0;
		this._throttleInterval = GEOLOCATION_THROTTLE_INTERVAL;

		this._rawWatchHandler = (position: GeoPosition) => {
			this.lastKnownPosition = position;
		};
		this.throttledWatchHandler = throttle(this._rawWatchHandler, this._throttleInterval);

		this.config = {
			geolocationOptions: config.geolocationOptions ?? DEFAULT_OPTIONS,
		};

		this.provider =
			provider ??
			new BrowserGeolocationProvider(
				typeof navigator !== 'undefined' ? navigator : null,
			);
	}

	/**
	 * Checks the current geolocation permission status using the Permissions API.
	 *
	 * Falls back to `'prompt'` when the Permissions API is unavailable or throws.
	 *
	 * @returns `'granted'`, `'denied'`, or `'prompt'`.
	 */
	async checkPermissions(): Promise<string> {
		try {
			const nav: Navigator | null =
				(this.provider as NavigatorAccessor).getNavigator?.() ??
				(typeof navigator !== 'undefined' ? navigator : null);
			if (nav && 'permissions' in nav) {
				const result = await nav.permissions.query({ name: 'geolocation' });
				return result.state;
			}
		} catch {
			// fall through to default
		}
		return 'prompt';
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
	getSingleLocationUpdate(): Promise<GeoPosition> {
		if (this.isPendingRequest && this.pendingPromise) {
			return this.pendingPromise;
		}

		if (
			Date.now() - this.lastSingleFetchTime < this._throttleInterval &&
			this.lastKnownPosition
		) {
			return Promise.resolve(this.lastKnownPosition);
		}

		this.pendingPromise = new Promise<GeoPosition>((resolve, reject) => {
			if (this.isPendingRequest) {
				const err = new Error('A geolocation request is already pending');
				err.name = 'RequestPendingError';
				reject(err);
				return;
			}

			if (!this.provider.isSupported()) {
				const err = new Error('Geolocation is not supported by this browser');
				err.name = 'NotSupportedError';
				reject(err);
				return;
			}

			this.isPendingRequest = true;

			this.provider.getCurrentPosition(
				(position) => {
					this.isPendingRequest = false;
					this.pendingPromise = null;
					this.lastKnownPosition = position;
					this.lastSingleFetchTime = Date.now();
					resolve(position);
				},
				(err) => {
					// Timeout (code 3) with high accuracy: retry once at low accuracy
					if (err.code === 3 && this.config.geolocationOptions.enableHighAccuracy !== false) {
						const fallbackOptions: GeoPositionOptions = {
							...this.config.geolocationOptions,
							enableHighAccuracy: false,
							timeout: 10_000,
						};
						this.provider.getCurrentPosition(
							(position) => {
								this.isPendingRequest = false;
								this.pendingPromise = null;
								this.lastKnownPosition = position;
								this.lastSingleFetchTime = Date.now();
								resolve(position);
							},
							(fallbackErr) => {
								this.isPendingRequest = false;
								this.pendingPromise = null;
								reject(fallbackErr);
							},
							fallbackOptions,
						);
						return;
					}

					this.isPendingRequest = false;
					this.pendingPromise = null;
					reject(err);
				},
				this.config.geolocationOptions,
			);
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
	watchCurrentLocation(
		onUpdate?: (position: GeoPosition) => void,
		onError?: (error: GeoPositionError) => void,
	): number | null {
		if (!this.provider.isSupported()) {
			return null;
		}

		if (this.isWatching) {
			return this.watchId;
		}

		this._rawWatchHandler = (position: GeoPosition) => {
			this.lastKnownPosition = position;
			onUpdate?.(position);
		};
		this.throttledWatchHandler = throttle(this._rawWatchHandler, this._throttleInterval);

		const watchId = this.provider.watchPosition(
			(position: GeoPosition) => this.throttledWatchHandler(position),
			(err: GeoPositionError) => {
				if (err.code === 3) {
					// Timeout is transient for a continuous watch; keep running
					return;
				}
				onError?.(err);
			},
			this.config.geolocationOptions,
		);

		this.watchId = watchId;
		this.isWatching = true;
		return this.watchId;
	}

	/**
	 * Stops watching the position.
	 *
	 * Safe to call when no watch is active.
	 */
	stopWatching(): void {
		if (this.watchId !== null && this.isWatching) {
			this.provider.clearWatch(this.watchId);
			this.watchId = null;
			this.isWatching = false;
		}
	}

	/** Returns the last position delivered by any method, or `null`. */
	getLastKnownPosition(): GeoPosition | null {
		return this.lastKnownPosition;
	}

	/** Returns `true` if a position watch is currently active. */
	isCurrentlyWatching(): boolean {
		return this.isWatching;
	}

	/** Returns the active watch ID, or `null` when not watching. */
	getCurrentWatchId(): number | null {
		return this.watchId;
	}

	/** Returns `true` while a `getSingleLocationUpdate` call is in flight. */
	hasPendingRequest(): boolean {
		return this.isPendingRequest;
	}

	/**
	 * Resets both throttle guards so the next position fetch and the next watch
	 * callback both execute immediately, regardless of elapsed time.
	 *
	 * Use sparingly — for example when the user explicitly taps "refresh location".
	 *
	 * @since 1.3.0
	 */
	flushThrottle(): void {
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
	 * @since 1.3.0
	 */
	setThrottleInterval(ms: number): void {
		this._throttleInterval = ms;
		this.throttledWatchHandler = throttle(this._rawWatchHandler, ms);
	}
}

export default GeolocationService;
export { GeolocationService };
