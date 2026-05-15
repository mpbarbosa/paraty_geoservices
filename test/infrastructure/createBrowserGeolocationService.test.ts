import {
	BrowserGeolocationProvider,
	GeolocationService,
	createBrowserGeolocationService,
} from '../../src';

describe('createBrowserGeolocationService', () => {
	it('exports the factory from the package entry point', () => {
		expect(typeof createBrowserGeolocationService).toBe('function');
	});

	it('creates a GeolocationService wired with BrowserGeolocationProvider', async () => {
		const mockNavigator = {
			geolocation: {
				getCurrentPosition: jest.fn((success: PositionCallback) =>
					success({
						coords: {
							latitude: -23.55,
							longitude: -46.63,
							accuracy: 10,
							altitude: null,
							altitudeAccuracy: null,
							heading: null,
							speed: null,
						},
						timestamp: 123,
					} as GeolocationPosition),
				),
				watchPosition: jest.fn(() => 1),
				clearWatch: jest.fn(),
			},
			permissions: {
				query: jest.fn().mockResolvedValue({ state: 'granted' }),
			},
		} as unknown as Navigator;

		const service = createBrowserGeolocationService({ navigator: mockNavigator });

		expect(service).toBeInstanceOf(GeolocationService);
		await expect(service.getSingleLocationUpdate()).resolves.toMatchObject({
			coords: { latitude: -23.55, longitude: -46.63 },
		});
		await expect(service.checkPermissions()).resolves.toBe('granted');
	});

	it('uses browser-specific provider wiring, not a mock fallback', async () => {
		const service = createBrowserGeolocationService({ navigator: null });

		await expect(service.getSingleLocationUpdate()).rejects.toMatchObject({
			name: 'NotSupportedError',
		});
	});

	it('preserves browser provider behavior for global navigator resolution', () => {
		const service = createBrowserGeolocationService();

		expect(service).toBeInstanceOf(GeolocationService);
		expect(BrowserGeolocationProvider).toBeDefined();
	});
});
