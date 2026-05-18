/**
 * @jest-environment node
 */

import { describe, test, expect, jest, afterEach } from '@jest/globals';
import { NominatimGeocoder } from '../../../src/infrastructure/providers/NominatimGeocoder';

describe('NominatimGeocoder', () => {
	const originalFetch = global.fetch;

	afterEach(() => {
		global.fetch = originalFetch;
	});

	test('reverseGeocode maps a successful JSON response', async () => {
		global.fetch = jest.fn<typeof fetch>().mockResolvedValue({
			ok: true,
			json: async () => ({
				address: { city: 'Rio de Janeiro', country: 'Brazil', country_code: 'br' },
			}),
		} as Response);

		const geocoder = new NominatimGeocoder();
		const result = await geocoder.reverseGeocode(-22.9, -43.17);

		expect(result.city).toBe('Rio de Janeiro');
		expect(result.country).toBe('Brasil');
	});

	test('reverseGeocode throws on non-OK HTTP status', async () => {
		global.fetch = jest.fn<typeof fetch>().mockResolvedValue({
			ok: false,
			status: 429,
			statusText: 'Too Many Requests',
		} as Response);

		const geocoder = new NominatimGeocoder();

		await expect(geocoder.reverseGeocode(-23.55, -46.63)).rejects.toMatchObject({
			code: 3,
			message: expect.stringContaining('HTTP 429'),
		});
	});

	test('reverseGeocode uses legacy fetch manager when configured', async () => {
		const legacyFetch = jest
			.fn<(url: string) => Promise<unknown>>()
			.mockResolvedValue({
				address: { city: 'São Paulo', country: 'Brazil', country_code: 'br' },
			});

		const geocoder = new NominatimGeocoder({
			legacyFetchManager: {
				fetch: legacyFetch,
				subscribe: jest.fn<(observer: unknown, url: string) => void>(),
			},
		});

		const result = await geocoder.reverseGeocode(-23.55, -46.63);

		expect(legacyFetch).toHaveBeenCalled();
		expect(result.city).toBe('São Paulo');
	});

	test('reverseGeocode rejects invalid coordinates', async () => {
		const geocoder = new NominatimGeocoder();
		await expect(
			geocoder.reverseGeocode(Number.NaN, -46.63),
		).rejects.toMatchObject({ code: 1 });
	});

	test('retries with CORS proxy when enabled', async () => {
		const fetchMock = jest
			.fn<typeof fetch>()
			.mockRejectedValueOnce(new Error('Failed to fetch'))
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					address: { city: 'Curitiba', country: 'Brazil', country_code: 'br' },
				}),
			} as Response);

		global.fetch = fetchMock;

		const geocoder = new NominatimGeocoder({ enableCorsFallback: true });
		const result = await geocoder.reverseGeocode(-25.42, -49.27);

		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(result.city).toBe('Curitiba');
	});

	test('legacy fetch errors are wrapped as network failures', async () => {
		const geocoder = new NominatimGeocoder({
			legacyFetchManager: {
				fetch: jest
					.fn<(url: string) => Promise<unknown>>()
					.mockRejectedValue(new Error('FetchManager error')),
				subscribe: jest.fn<(observer: unknown, url: string) => void>(),
			},
		});

		await expect(geocoder.reverseGeocode(-23.55, -46.63)).rejects.toEqual(
			expect.objectContaining({
				code: 2,
				message: expect.stringContaining('FetchManager error'),
			}),
		);
	});
});
