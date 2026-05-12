/**
 * Represents geographic coordinates and associated metadata returned by a provider.
 *
 * @module domain/entities/GeoPosition
 * @since 1.0.2
 * @author Marcelo Pereira Barbosa
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
