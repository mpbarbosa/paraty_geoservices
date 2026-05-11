/**
 * Abstract base class for geolocation providers.
 *
 * ARCHITECTURAL OVERVIEW:
 * Defines the contract that all geolocation providers must implement. This abstraction
 * enables dependency injection and makes the GeolocationService testable without
 * requiring actual device or browser APIs.
 *
 * DESIGN PRINCIPLES:
 * - Interface Segregation: Minimal, focused API for geolocation operations
 * - Dependency Inversion: Consumers depend on this abstraction, not on concrete implementations
 * - Open/Closed: Open for extension (new providers), closed for modification
 *
 * @module GeolocationProvider
 * @since 1.0.0
 * @author Marcelo Pereira Barbosa
 */

/**
 * Represents geographic coordinates and associated metadata returned by a provider.
 */
export interface GeoPosition {
	coords: {
		/** Latitude in decimal degrees. */
		latitude: number;
		/** Longitude in decimal degrees. */
		longitude: number;
		/** Accuracy of latitude/longitude in metres. */
		accuracy: number;
		/** Altitude in metres above the WGS84 ellipsoid, or `null` if unavailable. */
		altitude: number | null;
		/** Accuracy of altitude in metres, or `null` if unavailable. */
		altitudeAccuracy: number | null;
		/** Heading in degrees clockwise from true north, or `null` if unavailable. */
		heading: number | null;
		/** Ground speed in metres per second, or `null` if unavailable. */
		speed: number | null;
	};
	/** Unix timestamp (ms) at which the position was acquired. */
	timestamp: number;
}

/**
 * Represents an error returned by a geolocation provider.
 */
export interface GeoPositionError {
	/** Numeric error code: 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT. */
	readonly code: 1 | 2 | 3;
	/** Human-readable error description. */
	readonly message: string;
}

/**
 * Options that control how a geolocation provider acquires a position fix.
 */
export interface GeoPositionOptions {
	/** Request the most accurate position available. Defaults to `false`. */
	enableHighAccuracy?: boolean;
	/** Maximum time (ms) allowed to return a position. Defaults to `Infinity`. */
	timeout?: number;
	/** Maximum age (ms) of a cached position that is acceptable. Defaults to `0`. */
	maximumAge?: number;
}

/**
 * Abstract base class for geolocation providers.
 *
 * Extend this class and implement all four abstract methods to integrate a
 * new location source (e.g. browser Geolocation API, GPS hardware, mock).
 *
 * @abstract
 * @class GeolocationProvider
 *
 * @example
 * class BrowserGeolocationProvider extends GeolocationProvider {
 *   getCurrentPosition(success, error, options) {
 *     navigator.geolocation.getCurrentPosition(success, error, options);
 *   }
 *   watchPosition(success, error, options) {
 *     return navigator.geolocation.watchPosition(success, error, options);
 *   }
 *   clearWatch(watchId) {
 *     navigator.geolocation.clearWatch(watchId);
 *   }
 *   isSupported() {
 *     return 'geolocation' in navigator;
 *   }
 * }
 */
abstract class GeolocationProvider {
	/**
	 * Gets the current geographic position once.
	 *
	 * @param {(pos: GeoPosition) => void} successCallback - Invoked with the acquired position.
	 * @param {(err: GeoPositionError) => void} errorCallback - Invoked when acquisition fails.
	 * @param {GeoPositionOptions} [options] - Options controlling accuracy, timeout and caching.
	 * @returns {void}
	 *
	 * @example
	 * provider.getCurrentPosition(
	 *   (position) => console.log(position.coords.latitude),
	 *   (error) => console.error(error.message),
	 *   { enableHighAccuracy: true, timeout: 5000 }
	 * );
	 */
	abstract getCurrentPosition(
		successCallback: (pos: GeoPosition) => void,
		errorCallback: (err: GeoPositionError) => void,
		options?: GeoPositionOptions,
	): void;

	/**
	 * Starts watching the geographic position for changes.
	 *
	 * @param {(pos: GeoPosition) => void} successCallback - Invoked on every position update.
	 * @param {(err: GeoPositionError) => void} errorCallback - Invoked when an error occurs.
	 * @param {GeoPositionOptions} [options] - Options controlling accuracy, timeout and caching.
	 * @returns {number | null} A watch ID to pass to {@link clearWatch}, or `null` if unsupported.
	 *
	 * @example
	 * const watchId = provider.watchPosition(
	 *   (position) => console.log('Updated:', position.coords),
	 *   (error) => console.error(error.message),
	 *   { enableHighAccuracy: true }
	 * );
	 */
	abstract watchPosition(
		successCallback: (pos: GeoPosition) => void,
		errorCallback: (err: GeoPositionError) => void,
		options?: GeoPositionOptions,
	): number | null;

	/**
	 * Stops watching the geographic position.
	 *
	 * @param {number} watchId - The watch ID returned by {@link watchPosition}.
	 * @returns {void}
	 *
	 * @example
	 * provider.clearWatch(watchId);
	 */
	abstract clearWatch(watchId: number): void;

	/**
	 * Checks whether this provider can supply geolocation data in the current environment.
	 *
	 * @returns {boolean} `true` if geolocation is available; `false` otherwise.
	 *
	 * @example
	 * if (provider.isSupported()) {
	 *   provider.getCurrentPosition(onSuccess, onError);
	 * }
	 */
	abstract isSupported(): boolean;
}

export default GeolocationProvider;
/**
 * @exports GeolocationProvider - Abstract base class for geolocation provider implementations.
 * @exports GeoPosition - Interface describing an acquired geographic position.
 * @exports GeoPositionError - Interface describing a geolocation error.
 * @exports GeoPositionOptions - Interface for position acquisition options.
 */
export { GeolocationProvider };
