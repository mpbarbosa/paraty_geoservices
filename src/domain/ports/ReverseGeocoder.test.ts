/**
 * Unit tests for the {@link ReverseGeocoder} domain port.
 *
 * Strategy: exercise the contract through concrete test doubles that implement
 * the port, covering success and structured error paths.
 *
 * @module domain/ports/ReverseGeocoder.test
 */

import type { GeoAddress } from '../entities/GeoAddress';
import {
	createGeoReverseGeocodeError,
	type GeoReverseGeocodeError,
} from '../entities/GeoReverseGeocodeError';
import type { ReverseGeocoder } from './ReverseGeocoder';

const MOCK_ADDRESS: GeoAddress = {
	street: 'Example Street',
	streetNumber: '100',
	complement: null,
	neighborhood: 'Centro',
	city: 'São Paulo',
	metropolitanRegion: null,
	state: 'São Paulo',
	stateCode: 'SP',
	postalCode: '01000-000',
	country: 'Brasil',
};

class SuccessReverseGeocoder implements ReverseGeocoder {
	constructor(
		private readonly address: GeoAddress = MOCK_ADDRESS,
	) {}

	async reverseGeocode(
		latitude: number,
		longitude: number,
	): Promise<GeoAddress> {
		if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
			throw createGeoReverseGeocodeError(
				1,
				'(SuccessReverseGeocoder) Invalid coordinates',
			);
		}

		return this.address;
	}
}

class FailingReverseGeocoder implements ReverseGeocoder {
	constructor(private readonly error: GeoReverseGeocodeError) {}

	async reverseGeocode(
		_latitude: number,
		_longitude: number,
	): Promise<GeoAddress> {
		throw createGeoReverseGeocodeError(this.error.code, this.error.message);
	}
}

describe('ReverseGeocoder port', () => {
	it('resolves a GeoAddress from a conforming adapter', async () => {
		const geocoder = new SuccessReverseGeocoder();

		await expect(geocoder.reverseGeocode(-23.55, -46.63)).resolves.toEqual(
			MOCK_ADDRESS,
		);
	});

	it('rejects invalid coordinates with code 1', async () => {
		const geocoder = new SuccessReverseGeocoder();

		await expect(
			geocoder.reverseGeocode(Number.NaN, -46.63),
		).rejects.toMatchObject({
			code: 1,
			message: expect.stringContaining('Invalid coordinates'),
		});
	});

	it('propagates structured provider errors', async () => {
		const geocoder = new FailingReverseGeocoder({
			code: 3,
			message: 'Provider unavailable',
		});

		await expect(geocoder.reverseGeocode(-23.55, -46.63)).rejects.toMatchObject({
			code: 3,
			message: 'Provider unavailable',
		});
	});
});
