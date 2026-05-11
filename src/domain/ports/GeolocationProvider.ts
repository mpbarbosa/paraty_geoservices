/**
 * Abstract port that all geolocation providers must implement.
 *
 * ARCHITECTURAL OVERVIEW:
 * This is the inbound/outbound port in the domain layer. The application layer
 * depends only on this abstraction — never on concrete implementations — enabling
 * dependency injection, easy testability, and provider substitution at runtime.
 *
 * DESIGN PRINCIPLES:
 * - Interface Segregation: Minimal, focused API for geolocation operations
 * - Dependency Inversion: Consumers depend on this abstraction, not on concrete implementations
 * - Open/Closed: Open for extension (new providers), closed for modification
 *
 * @module domain/ports/GeolocationProvider
 * @since 1.0.1
 * @author Marcelo Pereira Barbosa
 */

import type { GeoPosition } from '../entities/GeoPosition';
import type { GeoPositionError } from '../entities/GeoPositionError';
import type { GeoPositionOptions } from '../entities/GeoPositionOptions';

export type { GeoPosition, GeoPositionError, GeoPositionOptions };

/**
 * Abstract base class (port) for geolocation providers.
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
	 * @param successCallback - Invoked with the acquired position.
	 * @param errorCallback   - Invoked when acquisition fails.
	 * @param options         - Options controlling accuracy, timeout and caching.
	 */
	abstract getCurrentPosition(
		successCallback: (pos: GeoPosition) => void,
		errorCallback: (err: GeoPositionError) => void,
		options?: GeoPositionOptions,
	): void;

	/**
	 * Starts watching the geographic position for changes.
	 *
	 * @param successCallback - Invoked on every position update.
	 * @param errorCallback   - Invoked when an error occurs.
	 * @param options         - Options controlling accuracy, timeout and caching.
	 * @returns A watch ID to pass to {@link clearWatch}, or `null` if unsupported.
	 */
	abstract watchPosition(
		successCallback: (pos: GeoPosition) => void,
		errorCallback: (err: GeoPositionError) => void,
		options?: GeoPositionOptions,
	): number | null;

	/**
	 * Stops watching the geographic position.
	 *
	 * @param watchId - The watch ID returned by {@link watchPosition}.
	 */
	abstract clearWatch(watchId: number): void;

	/**
	 * Checks whether this provider can supply geolocation data in the current environment.
	 *
	 * @returns `true` if geolocation is available; `false` otherwise.
	 */
	abstract isSupported(): boolean;
}

export default GeolocationProvider;
export { GeolocationProvider };
