"use strict";
/**
 * Mock reverse geocoder for tests and deterministic local development.
 *
 * Implements the {@link ReverseGeocoder} domain port without HTTP or browser APIs.
 *
 * @module infrastructure/providers/MockReverseGeocoder
 * @since 1.2.6
 * @author Marcelo Pereira Barbosa
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockReverseGeocoder = void 0;
const GeoReverseGeocodeError_1 = require("../../domain/entities/GeoReverseGeocodeError");
/**
 * Deterministic {@link ReverseGeocoder} for tests.
 *
 * @class MockReverseGeocoder
 * @since 1.2.6
 */
class MockReverseGeocoder {
    constructor(config = {}) {
        this.config = {
            defaultAddress: config.defaultAddress ?? MOCK_DEFAULT_ADDRESS,
            defaultError: config.defaultError ?? null,
        };
    }
    async reverseGeocode(latitude, longitude) {
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            throw (0, GeoReverseGeocodeError_1.createGeoReverseGeocodeError)(1, '(MockReverseGeocoder) Invalid coordinates');
        }
        if (this.config.defaultError) {
            throw (0, GeoReverseGeocodeError_1.createGeoReverseGeocodeError)(this.config.defaultError.code, this.config.defaultError.message);
        }
        return this.config.defaultAddress;
    }
}
exports.MockReverseGeocoder = MockReverseGeocoder;
const MOCK_DEFAULT_ADDRESS = {
    street: 'Mock Street',
    streetNumber: '1',
    complement: null,
    neighborhood: 'Mock District',
    city: 'Mock City',
    metropolitanRegion: null,
    state: 'Mock State',
    stateCode: 'MS',
    postalCode: '00000-000',
    country: 'Brasil',
};
//# sourceMappingURL=MockReverseGeocoder.js.map