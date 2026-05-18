/**
 * @jest-environment node
 * @module application/services/ReverseGeocoder.test
 */

import {
	describe,
	test,
	expect,
	jest,
	afterEach,
	beforeEach,
} from '@jest/globals';
import { ReverseGeocoder } from './ReverseGeocoder';
import { MockReverseGeocoder } from '../../infrastructure/providers/MockReverseGeocoder';
import { createReverseGeocoderService } from '../../infrastructure/createReverseGeocoderService';
import { NominatimGeocoder } from '../../infrastructure/providers/NominatimGeocoder';
import { POSITION_UPDATE_EVENT } from './reverseGeocoderEvents';
import type { GeoAddress } from '../../domain/entities/GeoAddress';

const SAO_PAULO_ADDRESS: GeoAddress = {
	street: 'Avenida Paulista',
	streetNumber: null,
	complement: null,
	neighborhood: 'Jardins',
	city: 'São Paulo',
	metropolitanRegion: null,
	state: 'São Paulo',
	stateCode: 'SP',
	postalCode: null,
	country: 'Brasil',
};

function createServiceWithMocks(options?: {
	nominatim?: MockReverseGeocoder;
	aws?: MockReverseGeocoder | null;
	primary?: 'aws' | 'nominatim';
}) {
	const nominatim =
		options?.nominatim ??
		new MockReverseGeocoder({ defaultAddress: SAO_PAULO_ADDRESS });
	const aws = options?.aws ?? null;

	return new ReverseGeocoder({
		nominatimGeocoder: nominatim,
		awsGeocoder: aws,
		geocodingPrimaryProvider: options?.primary ?? 'nominatim',
		emitBrowserProviderEvents: false,
	});
}

describe('ReverseGeocoderService', () => {
	beforeEach(() => {
		jest.restoreAllMocks();
	});

	describe('toString', () => {
		test('formats coordinates when set', () => {
			const geocoder = createServiceWithMocks();
			geocoder.setCoordinates(-23.5505, -46.6333);
			expect(geocoder.toString()).toBe('ReverseGeocoder: -23.5505, -46.6333');
		});

		test('reports missing coordinates', () => {
			const geocoder = createServiceWithMocks();
			expect(geocoder.toString()).toBe('ReverseGeocoder: No coordinates set');
		});

		test('accepts zero coordinates', () => {
			const geocoder = createServiceWithMocks();
			geocoder.setCoordinates(0, -46.6333);
			expect(geocoder.toString()).toBe('ReverseGeocoder: 0, -46.6333');
		});
	});

	describe('coordinate validation', () => {
		test('rejects fetch when coordinates were not set', async () => {
			const geocoder = createServiceWithMocks();
			await expect(geocoder.fetchAddress()).rejects.toThrow('Invalid coordinates');
		});

		test('ignores invalid coordinates in setCoordinates', async () => {
			const geocoder = createServiceWithMocks();
			geocoder.data = SAO_PAULO_ADDRESS;
			geocoder.setCoordinates(null as unknown as number, -46.63);
			expect(geocoder.data).toEqual(SAO_PAULO_ADDRESS);
		});
	});

	describe('fetchAddress with injected ports', () => {
		test('returns GeoAddress from nominatim provider', async () => {
			const geocoder = createServiceWithMocks();
			geocoder.setCoordinates(-23.55, -46.63);
			const result = await geocoder.fetchAddress();
			expect(result.city).toBe('São Paulo');
			expect(geocoder.currentAddress?.city).toBe('São Paulo');
		});

		test('uses AWS as primary when configured', async () => {
			const awsAddress: GeoAddress = { ...SAO_PAULO_ADDRESS, city: 'AWS City' };
			const nominatim = new MockReverseGeocoder({
				defaultAddress: { ...SAO_PAULO_ADDRESS, city: 'Nominatim City' },
			});
			const aws = new MockReverseGeocoder({ defaultAddress: awsAddress });
			const geocoder = createServiceWithMocks({
				nominatim,
				aws,
				primary: 'aws',
			});
			geocoder.setCoordinates(-23.55, -46.63);
			const result = await geocoder.fetchAddress();
			expect(result.city).toBe('AWS City');
		});

		test('falls back to AWS when nominatim fails', async () => {
			const nominatim = new MockReverseGeocoder({
				defaultError: { code: 2, message: 'network down' },
			});
			const aws = new MockReverseGeocoder({
				defaultAddress: { ...SAO_PAULO_ADDRESS, city: 'Fallback AWS' },
			});
			const geocoder = createServiceWithMocks({
				nominatim,
				aws,
				primary: 'nominatim',
			});
			geocoder.setCoordinates(-23.55, -46.63);
			const result = await geocoder.fetchAddress();
			expect(result.city).toBe('Fallback AWS');
		});

		test('falls back to Nominatim when AWS primary fails', async () => {
			const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			const nominatim = new MockReverseGeocoder({
				defaultAddress: { ...SAO_PAULO_ADDRESS, city: 'Recovered by Nominatim' },
			});
			const aws = new MockReverseGeocoder({
				defaultError: { code: 3, message: 'aws unavailable' },
			});
			const geocoder = createServiceWithMocks({
				nominatim,
				aws,
				primary: 'aws',
			});

			geocoder.setCoordinates(-23.55, -46.63);

			await expect(geocoder.fetchAddress()).resolves.toMatchObject({
				city: 'Recovered by Nominatim',
			});
			expect(warnSpy).toHaveBeenCalledWith(
				'(ReverseGeocoder.fetchAddress) AWS provider failed, falling back to Nominatim:',
				'aws unavailable',
			);
		});

		test('rethrows the original Nominatim error when AWS fallback also fails', async () => {
			const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			const nominatim = new MockReverseGeocoder({
				defaultError: { code: 2, message: 'nominatim down' },
			});
			const aws = new MockReverseGeocoder({
				defaultError: { code: 3, message: 'aws down too' },
			});
			const geocoder = createServiceWithMocks({
				nominatim,
				aws,
				primary: 'nominatim',
			});

			geocoder.setCoordinates(-23.55, -46.63);

			await expect(geocoder.fetchAddress()).rejects.toMatchObject({
				message: 'nominatim down',
			});
			expect(warnSpy).toHaveBeenCalledWith(
				'(ReverseGeocoder.fetchAddress) AWS fallback also failed:',
				'aws down too',
			);
		});

		test('reverseGeocode delegates to fetchAddress', async () => {
			const geocoder = createServiceWithMocks();
			geocoder.setCoordinates(-23.55, -46.63);

			await expect(geocoder.reverseGeocode()).resolves.toMatchObject({
				city: 'São Paulo',
			});
		});
	});

	describe('provider switching', () => {
		test('switchProvider updates primary provider', () => {
			const geocoder = createServiceWithMocks({ primary: 'aws' });
			geocoder.switchProvider('nominatim');
			expect(geocoder.getPrimaryProvider()).toBe('nominatim');
		});

		test('switchProvider returns early when provider is unchanged', () => {
			const geocoder = createServiceWithMocks({ primary: 'aws' });

			geocoder.switchProvider('aws');

			expect(geocoder.getPrimaryProvider()).toBe('aws');
		});

		test('switchProvider rejects unknown values', () => {
			const geocoder = createServiceWithMocks();
			expect(() =>
				geocoder.switchProvider('other' as 'aws'),
			).toThrow(/Unknown provider/);
		});

		test('hasAwsProvider reflects injection', () => {
			const withAws = createServiceWithMocks({
				aws: new MockReverseGeocoder(),
			});
			const withoutAws = createServiceWithMocks();
			expect(withAws.hasAwsProvider()).toBe(true);
			expect(withoutAws.hasAwsProvider()).toBe(false);
		});
	});

	describe('createReverseGeocoderService factory', () => {
		const originalFetch = global.fetch;

		afterEach(() => {
			global.fetch = originalFetch;
		});

		test('wires legacy fetch manager for Nominatim HTTP', async () => {
			const fetchFn = jest
				.fn<(url: string) => Promise<unknown>>()
				.mockResolvedValue({
					address: { city: 'São Paulo', country: 'Brazil', country_code: 'br' },
				});
			const geocoder = createReverseGeocoderService({
				fetch: fetchFn,
				subscribe: jest.fn<(observer: unknown, url: string) => void>(),
			}, {});
			geocoder.setCoordinates(-23.55, -46.63);
			const result = await geocoder.fetchAddress();
			expect(fetchFn).toHaveBeenCalled();
			expect(result.city).toBe('São Paulo');
		});

		test('exposes nominatim URL after fetch', async () => {
			const geocoder = createReverseGeocoderService(
				{
					fetch: jest
						.fn<(url: string) => Promise<unknown>>()
						.mockResolvedValue({
							address: { city: 'São Paulo', country: 'Brazil', country_code: 'br' },
						}),
					subscribe: jest.fn<(observer: unknown, url: string) => void>(),
				},
				{},
			);
			geocoder.setCoordinates(-23.55, -46.63);
			await geocoder.fetchAddress();
			expect(geocoder.url).toContain('nominatim.openstreetmap.org');
			expect(geocoder.url).toContain('lat=-23.55');
		});

		test('uses custom base URL from config', async () => {
			const fetchFn = jest
				.fn<(url: string) => Promise<unknown>>()
				.mockResolvedValue({
					address: { city: 'X', country: 'Brazil', country_code: 'br' },
				});
			const geocoder = createReverseGeocoderService(
				{
					fetch: fetchFn,
					subscribe: jest.fn<(observer: unknown, url: string) => void>(),
				},
				{
					openstreetmapBaseUrl:
						'https://custom.geocoding.api/reverse?format=json',
				},
			);
			geocoder.setCoordinates(-23.55, -46.63);
			await geocoder.fetchAddress();
			expect(geocoder.url).toContain('custom.geocoding.api');
		});

		test('creates an AWS provider only when enabled with a base URL', () => {
			const geocoder = createReverseGeocoderService(null, {
				awsLbsEnabled: true,
				awsLbsBaseUrl: 'https://aws.example.test',
			});

			expect(geocoder.hasAwsProvider()).toBe(true);
		});

		test('does not create an AWS provider when the base URL is empty', () => {
			const geocoder = createReverseGeocoderService();

			expect(geocoder.hasAwsProvider()).toBe(false);
		});

		test('prefers an injected AWS geocoder over factory-created wiring', async () => {
			const aws = new MockReverseGeocoder({
				defaultAddress: { ...SAO_PAULO_ADDRESS, city: 'Injected AWS' },
			});
			const geocoder = createReverseGeocoderService(null, {
				awsGeocoder: aws,
				awsLbsEnabled: true,
				awsLbsBaseUrl: 'https://ignored.example.test',
				geocodingPrimaryProvider: 'aws',
			});

			geocoder.setCoordinates(-23.55, -46.63);

			await expect(geocoder.fetchAddress()).resolves.toMatchObject({
				city: 'Injected AWS',
			});
		});
	});

	describe('Nominatim HTTP errors via factory', () => {
		const originalFetch = global.fetch;

		afterEach(() => {
			global.fetch = originalFetch;
		});

		test('propagates network errors', async () => {
			global.fetch = jest
				.fn<typeof fetch>()
				.mockRejectedValue(new Error('Network error'));
			const geocoder = createReverseGeocoderService(null);
			geocoder.setCoordinates(-23.55, -46.63);
			await expect(geocoder.fetchAddress()).rejects.toMatchObject({
				message: expect.stringContaining('Network error'),
			});
		});

		test('propagates HTTP status errors', async () => {
			global.fetch = jest.fn<typeof fetch>().mockResolvedValue({
				ok: false,
				status: 500,
				statusText: 'Internal Server Error',
			} as Response);
			const geocoder = createReverseGeocoderService(null);
			geocoder.setCoordinates(-23.55, -46.63);
			await expect(geocoder.fetchAddress()).rejects.toMatchObject({
				message: expect.stringContaining('HTTP 500'),
			});
		});
	});

	describe('observers', () => {
		test('subscribe and notify', () => {
			const geocoder = createServiceWithMocks();
			const observer = { update: jest.fn() };
			geocoder.subscribe(observer);
			geocoder.notifyObservers('event', { data: 'test' });
			expect(observer.update).toHaveBeenCalledWith('event', { data: 'test' });
		});

		test('notifies on successful fetchAddress', async () => {
			const geocoder = createServiceWithMocks();
			const observer = { update: jest.fn() };
			geocoder.subscribe(observer);
			geocoder.setCoordinates(-23.55, -46.63);
			await geocoder.fetchAddress();
			expect(observer.update).toHaveBeenCalled();
		});
	});

	describe('update (position observer)', () => {
		test('triggers geocoding on position update', async () => {
			const geocoder = createServiceWithMocks();
			geocoder.update(
				{ lastPosition: { coords: { latitude: -23.55, longitude: -46.63 } } },
				POSITION_UPDATE_EVENT,
				false,
				null,
			);
			await Promise.resolve();
			await Promise.resolve();
			expect(geocoder.latitude).toBe(-23.55);
			expect(geocoder.currentAddress?.city).toBe('São Paulo');
		});

		test('ignores non-update events', () => {
			const geocoder = createServiceWithMocks();
			geocoder.update(
				{ lastPosition: { coords: { latitude: -23.55, longitude: -46.63 } } },
				'PositionManager not updated',
				false,
				null,
			);
			expect(geocoder.latitude).toBeNull();
		});

		test('applies Brazilian address extractor when configured', async () => {
			const geocoder = createServiceWithMocks();
			geocoder.AddressDataExtractor = {
				getBrazilianStandardAddress: jest.fn().mockReturnValue({
					logradouro: 'Avenida Paulista',
					municipio: 'São Paulo',
				}),
			};
			geocoder.setCoordinates(-23.55, -46.63);
			await geocoder.fetchAddress();
			expect(
				geocoder.AddressDataExtractor.getBrazilianStandardAddress,
			).toHaveBeenCalled();
			expect(geocoder.enderecoPadronizado).toEqual({
				logradouro: 'Avenida Paulista',
				municipio: 'São Paulo',
			});
		});

		test('warns and returns early without a valid position manager', () => {
			const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			const geocoder = createServiceWithMocks();

			geocoder.update(null, POSITION_UPDATE_EVENT, false, null);
			geocoder.update({}, POSITION_UPDATE_EVENT, false, null);

			expect(warnSpy).toHaveBeenCalledWith(
				'(ReverseGeocoder) Invalid PositionManager or no last position.',
			);
			expect(geocoder.latitude).toBeNull();
		});

		test('warns when the position update has invalid coordinates', () => {
			const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			const geocoder = createServiceWithMocks();

			geocoder.update(
				{
					lastPosition: {
						coords: { latitude: Number.NaN, longitude: -46.63 },
					},
				},
				POSITION_UPDATE_EVENT,
				false,
				null,
			);

			expect(warnSpy).toHaveBeenCalledWith(
				'(ReverseGeocoder) Position update received without valid coordinates.',
				{ latitude: Number.NaN, longitude: -46.63 },
			);
		});

		test('stores asynchronous geocoding errors triggered by update', async () => {
			const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
			const geocoder = createServiceWithMocks({
				nominatim: new MockReverseGeocoder({
					defaultError: { code: 2, message: 'Failed to fetch' },
				}),
			});

			geocoder.update(
				{ lastPosition: { coords: { latitude: -23.55, longitude: -46.63 } } },
				POSITION_UPDATE_EVENT,
				false,
				null,
			);

			await Promise.resolve();
			await Promise.resolve();
			await new Promise<void>((resolve) => setImmediate(resolve));

			expect(errorSpy).toHaveBeenCalledWith(
				'(ReverseGeocoder.update) Geocoding failed:',
				expect.objectContaining({ message: 'Failed to fetch' }),
			);
			expect(geocoder.error).toEqual(expect.objectContaining({ message: 'Failed to fetch' }));
		});
	});

	describe('cache key', () => {
		test('builds key from coordinates', () => {
			const geocoder = createServiceWithMocks();
			geocoder.setCoordinates(-23.55, -46.63);
			expect(geocoder.getCacheKey()).toBe('-23.55,-46.63');
		});
	});

	describe('error notifier', () => {
		test('calls errorNotifier on CORS-like failures', async () => {
			const nominatim = new MockReverseGeocoder({
				defaultError: { code: 2, message: 'Failed to fetch' },
			});
			const notifier = { displayError: jest.fn() };
			const geocoder = new ReverseGeocoder({
				nominatimGeocoder: nominatim,
				errorNotifier: notifier,
				emitBrowserProviderEvents: false,
			});
			geocoder.setCoordinates(-23.55, -46.63);
			await expect(geocoder.fetchAddress()).rejects.toBeDefined();
			expect(notifier.displayError).toHaveBeenCalled();
		});

		test('shows a friendly message for HTTP 429 failures', async () => {
			const nominatim = new MockReverseGeocoder({
				defaultError: { code: 3, message: 'HTTP 429: Too Many Requests' },
			});
			const notifier = { displayError: jest.fn() };
			const geocoder = new ReverseGeocoder({
				nominatimGeocoder: nominatim,
				errorNotifier: notifier,
				emitBrowserProviderEvents: false,
			});
			const observer = { update: jest.fn() };
			geocoder.subscribe(observer);
			geocoder.setCoordinates(-23.55, -46.63);

			await expect(geocoder.fetchAddress()).rejects.toBeDefined();

			expect(notifier.displayError).toHaveBeenCalledWith(
				'Erro de Rede',
				'Limite de requisições atingido. Aguarde alguns segundos e tente novamente.',
			);
			expect(observer.update).toHaveBeenCalledWith(
				null,
				null,
				'Geocoding error',
				false,
				expect.objectContaining({ message: 'HTTP 429: Too Many Requests' }),
			);
		});

		test('shows a friendly message for HTTP 425 failures', async () => {
			const nominatim = new MockReverseGeocoder({
				defaultError: { code: 3, message: 'HTTP 425: Too Early' },
			});
			const notifier = { displayError: jest.fn() };
			const geocoder = new ReverseGeocoder({
				nominatimGeocoder: nominatim,
				errorNotifier: notifier,
				emitBrowserProviderEvents: false,
			});

			geocoder.setCoordinates(-23.55, -46.63);

			await expect(geocoder.fetchAddress()).rejects.toBeDefined();

			expect(notifier.displayError).toHaveBeenCalledWith(
				'Erro de Rede',
				'Serviço temporariamente indisponível. Tente novamente em alguns segundos.',
			);
		});
	});

	describe('deprecated compatibility accessors', () => {
		test('writes through enderecoPadronizado', () => {
			const geocoder = createServiceWithMocks();

			geocoder.enderecoPadronizado = { city: 'São Paulo' };

			expect(geocoder.standardizedAddress).toEqual({ city: 'São Paulo' });
		});

		test('returns the second observer parameter', () => {
			const geocoder = createServiceWithMocks();
			geocoder.standardizedAddress = { city: 'São Paulo' };

			expect(geocoder.secondUpdateParam()).toEqual({ city: 'São Paulo' });
		});
	});

	describe('_subscribe legacy hook', () => {
		test('delegates to nominatim legacy subscribe', () => {
			const subscribe = jest.fn<(observer: unknown, url: string) => void>();
			const nominatim = new NominatimGeocoder({
				legacyFetchManager: {
					fetch: jest.fn<(url: string) => Promise<unknown>>().mockResolvedValue({
						address: { city: 'São Paulo', country: 'Brazil', country_code: 'br' },
					}),
					subscribe,
				},
			});
			const geocoder = new ReverseGeocoder({
				nominatimGeocoder: nominatim,
				emitBrowserProviderEvents: false,
			});
			const observer = { update: jest.fn() };
			geocoder.subscribe(observer);
			geocoder.setCoordinates(-23.55, -46.63);
			geocoder._subscribe(nominatim.buildUrl(-23.55, -46.63));
			expect(subscribe).toHaveBeenCalledWith(
				observer,
				expect.stringContaining('lat=-23.55'),
			);
		});
	});

	describe('browser provider events', () => {
		const originalWindow = globalThis.window;

		afterEach(() => {
			if (originalWindow === undefined) {
				Reflect.deleteProperty(globalThis, 'window');
				return;
			}

			Object.defineProperty(globalThis, 'window', {
				value: originalWindow,
				configurable: true,
				writable: true,
			});
		});

		test('dispatches a provider-used event after a successful fetch', async () => {
			const dispatchEvent = jest.fn<(event: Event) => boolean>().mockReturnValue(true);
			Object.defineProperty(globalThis, 'window', {
				value: {
					dispatchEvent,
				},
				configurable: true,
				writable: true,
			});
			const geocoder = new ReverseGeocoder({
				nominatimGeocoder: new MockReverseGeocoder(),
				emitBrowserProviderEvents: true,
			});

			geocoder.setCoordinates(-23.55, -46.63);
			await geocoder.fetchAddress();

			expect(dispatchEvent).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'geocoder-provider-used',
					detail: { provider: 'nominatim' },
				}),
			);
		});

		test('dispatches a provider-changed event when switching providers', () => {
			const dispatchEvent = jest.fn<(event: Event) => boolean>().mockReturnValue(true);
			Object.defineProperty(globalThis, 'window', {
				value: {
					dispatchEvent,
				},
				configurable: true,
				writable: true,
			});
			const geocoder = new ReverseGeocoder({
				nominatimGeocoder: new MockReverseGeocoder(),
				awsGeocoder: new MockReverseGeocoder(),
				geocodingPrimaryProvider: 'aws',
				emitBrowserProviderEvents: true,
			});

			geocoder.switchProvider('nominatim');

			expect(dispatchEvent).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'geocoder-provider-changed',
					detail: { provider: 'nominatim' },
				}),
			);
		});
	});
});
