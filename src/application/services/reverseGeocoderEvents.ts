/**
 * Event constants used by {@link ReverseGeocoderService} observer notifications.
 *
 * @module application/services/reverseGeocoderEvents
 * @since 1.6.0
 */

/** Emitted when reverse geocoding returns a new address. */
export const ADDRESS_FETCHED_EVENT = 'Address fetched';

/** Emitted when reverse geocoding fails. */
export const GEOCODING_ERROR_EVENT = 'Geocoding error';

/** PositionManager event: coordinates were accepted and updated. */
export const POSITION_UPDATE_EVENT = 'PositionManager updated';

/** PositionManager event: immediate address refresh without full position gate. */
export const IMMEDIATE_ADDRESS_UPDATE_EVENT = 'Immediate address update';
