"use strict";
/**
 * Represents an error returned by a reverse geocoding provider.
 *
 * @module domain/entities/GeoReverseGeocodeError
 * @since 1.2.6
 * @author Marcelo Pereira Barbosa
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGeoReverseGeocodeError = createGeoReverseGeocodeError;
/**
 * Creates an `Error` instance that also satisfies {@link GeoReverseGeocodeError}.
 *
 * @param code    - Domain error code.
 * @param message - Human-readable description.
 */
function createGeoReverseGeocodeError(code, message) {
    return Object.assign(new Error(message), { code });
}
//# sourceMappingURL=GeoReverseGeocodeError.js.map