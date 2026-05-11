/**
 * Represents an error returned by a geolocation provider.
 *
 * @module domain/entities/GeoPositionError
 * @since 1.0.1
 * @author Marcelo Pereira Barbosa
 */
export interface GeoPositionError {
	/** Numeric error code: 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT. */
	readonly code: 1 | 2 | 3;
	/** Human-readable error description. */
	readonly message: string;
}
