"use strict";
/**
 * Event constants used by {@link ReverseGeocoderService} observer notifications.
 *
 * @module application/services/reverseGeocoderEvents
 * @since 1.6.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IMMEDIATE_ADDRESS_UPDATE_EVENT = exports.POSITION_UPDATE_EVENT = exports.GEOCODING_ERROR_EVENT = exports.ADDRESS_FETCHED_EVENT = void 0;
/** Emitted when reverse geocoding returns a new address. */
exports.ADDRESS_FETCHED_EVENT = 'Address fetched';
/** Emitted when reverse geocoding fails. */
exports.GEOCODING_ERROR_EVENT = 'Geocoding error';
/** PositionManager event: coordinates were accepted and updated. */
exports.POSITION_UPDATE_EVENT = 'PositionManager updated';
/** PositionManager event: immediate address refresh without full position gate. */
exports.IMMEDIATE_ADDRESS_UPDATE_EVENT = 'Immediate address update';
//# sourceMappingURL=reverseGeocoderEvents.js.map