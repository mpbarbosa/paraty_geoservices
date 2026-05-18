/**
 * Mock reverse geocoder for tests and deterministic local development.
 *
 * Implements the {@link ReverseGeocoder} domain port without HTTP or browser APIs.
 *
 * @module infrastructure/providers/MockReverseGeocoder
 * @since 1.2.6
 * @author Marcelo Pereira Barbosa
 */

import type { GeoAddress } from '../../domain/entities/GeoAddress';
import {
	createGeoReverseGeocodeError,
	type GeoReverseGeocodeError,
} from '../../domain/entities/GeoReverseGeocodeError';
import type { ReverseGeocoder } from '../../domain/ports/ReverseGeocoder';

export interface MockReverseGeocoderConfig {
	defaultAddress?: GeoAddress | null;
	defaultError?: GeoReverseGeocodeError | null;
}

/**
 * Deterministic {@link ReverseGeocoder} for tests.
 *
 * @class MockReverseGeocoder
 * @since 1.2.6
 */
export class MockReverseGeocoder implements ReverseGeocoder {
	private readonly config: Required<MockReverseGeocoderConfig>;

	constructor(config: MockReverseGeocoderConfig = {}) {
		this.config = {
			defaultAddress: config.defaultAddress ?? MOCK_DEFAULT_ADDRESS,
			defaultError: config.defaultError ?? null,
		};
	}

	async reverseGeocode(
		latitude: number,
		longitude: number,
	): Promise<GeoAddress> {
		if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
			throw createGeoReverseGeocodeError(
				1,
				'(MockReverseGeocoder) Invalid coordinates',
			);
		}

		if (this.config.defaultError) {
			throw createGeoReverseGeocodeError(
				this.config.defaultError.code,
				this.config.defaultError.message,
			);
		}

		return this.config.defaultAddress!;
	}
}

const MOCK_DEFAULT_ADDRESS: GeoAddress = {
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
