/**
 * Represents an error returned by a reverse geocoding provider.
 *
 * @module domain/entities/GeoReverseGeocodeError
 * @since 1.2.6
 * @author Marcelo Pereira Barbosa
 */

/**
 * Structured error for reverse-geocoding failures.
 *
 * Codes:
 * - `1` — invalid coordinates (non-finite latitude or longitude)
 * - `2` — network or transport failure
 * - `3` — provider error (non-success HTTP status or unusable response)
 */
export interface GeoReverseGeocodeError {
	/** Numeric error code. See {@link GeoReverseGeocodeError} for meanings. */
	readonly code: 1 | 2 | 3;
	/** Human-readable error description. */
	readonly message: string;
}

/**
 * Creates an `Error` instance that also satisfies {@link GeoReverseGeocodeError}.
 *
 * @param code    - Domain error code.
 * @param message - Human-readable description.
 */
export function createGeoReverseGeocodeError(
	code: GeoReverseGeocodeError['code'],
	message: string,
): Error & GeoReverseGeocodeError {
	return Object.assign(new Error(message), { code });
}
