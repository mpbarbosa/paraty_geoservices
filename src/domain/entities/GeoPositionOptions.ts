/**
 * Options that control how a geolocation provider acquires a position fix.
 *
 * @module domain/entities/GeoPositionOptions
 * @since 1.0.1
 * @author Marcelo Pereira Barbosa
 */
export interface GeoPositionOptions {
	/** Request the most accurate position available. Defaults to `false`. */
	enableHighAccuracy?: boolean;
	/** Maximum time (ms) allowed to return a position. Defaults to `Infinity`. */
	timeout?: number;
	/** Maximum age (ms) of a cached position that is acceptable. Defaults to `0`. */
	maximumAge?: number;
}
