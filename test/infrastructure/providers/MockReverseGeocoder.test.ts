import {
	MockReverseGeocoder,
	type MockReverseGeocoderConfig,
} from '../../../src/infrastructure/providers/MockReverseGeocoder';
import { MockReverseGeocoder as PublicMockReverseGeocoder } from '../../../src';

describe('MockReverseGeocoder', () => {
	it('returns a default GeoAddress for valid coordinates', async () => {
		const geocoder = new MockReverseGeocoder();

		const address = await geocoder.reverseGeocode(-23.55, -46.63);

		expect(address.city).toBe('Mock City');
		expect(address.country).toBe('Brasil');
	});

	it('returns a configured address', async () => {
		const config: MockReverseGeocoderConfig = {
			defaultAddress: {
				street: 'Configured',
				streetNumber: null,
				complement: null,
				neighborhood: null,
				city: 'Test City',
				metropolitanRegion: null,
				state: null,
				stateCode: null,
				postalCode: null,
				country: 'Brasil',
			},
		};
		const geocoder = new MockReverseGeocoder(config);

		const address = await geocoder.reverseGeocode(0, 0);

		expect(address.street).toBe('Configured');
		expect(address.city).toBe('Test City');
	});

	it('throws code 1 for invalid coordinates', async () => {
		const geocoder = new MockReverseGeocoder();

		await expect(geocoder.reverseGeocode(Number.NaN, 0)).rejects.toMatchObject({
			code: 1,
		});
	});

	it('throws a configured provider error', async () => {
		const geocoder = new MockReverseGeocoder({
			defaultError: { code: 3, message: 'Unavailable' },
		});

		await expect(geocoder.reverseGeocode(-23.55, -46.63)).rejects.toMatchObject({
			code: 3,
			message: 'Unavailable',
		});
	});

	it('is exported from the package entry point', () => {
		expect(PublicMockReverseGeocoder).toBe(MockReverseGeocoder);
	});
});
