/**
 * Tests for GeolocationService — throttling, race-condition protection, and provider integration.
 *
 * Consolidated from guia_js test suites:
 *   GeolocationService.throttle.test.ts
 *   GeolocationService.raceCondition.test.ts
 *   GeolocationService.branches.test.ts
 *   GeolocationService.injection.test.ts
 *   GeolocationService.providerPattern.test.ts
 *
 * @module application/services/GeolocationService.test
 * @since 1.3.0
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { GeolocationService } from './GeolocationService';
import { MockGeolocationProvider } from '../../infrastructure/providers/MockGeolocationProvider';
import { BrowserGeolocationProvider } from '../../infrastructure/providers/BrowserGeolocationProvider';
import type { GeoPosition } from '../../domain/entities/GeoPosition';
import type { GeoPositionError } from '../../domain/entities/GeoPositionError';

// ─── fixtures ────────────────────────────────────────────────────────────────

function makePosition(lat = -23.55, lon = -46.63, ts = Date.now()): GeoPosition {
	return {
		coords: {
			latitude: lat,
			longitude: lon,
			accuracy: 10,
			altitude: null,
			altitudeAccuracy: null,
			heading: null,
			speed: null,
		},
		timestamp: ts,
	};
}

const MOCK_ERROR: GeoPositionError = { code: 1, message: 'Permission denied' };
const TIMEOUT_ERROR: GeoPositionError = { code: 3, message: 'Timeout' };

// ─── getSingleLocationUpdate ─────────────────────────────────────────────────

describe('GeolocationService – getSingleLocationUpdate', () => {
	it('resolves with position on success', async () => {
		const pos = makePosition();
		const provider = new MockGeolocationProvider({ defaultPosition: pos });
		const service = new GeolocationService(provider);

		await expect(service.getSingleLocationUpdate()).resolves.toBe(pos);
	});

	it('caches position in lastKnownPosition', async () => {
		const pos = makePosition();
		const provider = new MockGeolocationProvider({ defaultPosition: pos });
		const service = new GeolocationService(provider);

		await service.getSingleLocationUpdate();

		expect(service.getLastKnownPosition()).toBe(pos);
	});

	it('rejects with GeoPositionError on provider error', async () => {
		const provider = new MockGeolocationProvider({ defaultError: MOCK_ERROR });
		const service = new GeolocationService(provider);

		await expect(service.getSingleLocationUpdate()).rejects.toMatchObject({ code: 1 });
	});

	it('rejects with NotSupportedError when provider is not supported', async () => {
		const provider = new MockGeolocationProvider({ supported: false });
		const service = new GeolocationService(provider);

		await expect(service.getSingleLocationUpdate()).rejects.toMatchObject({
			name: 'NotSupportedError',
		});
	});

	it('retries with low accuracy when high-accuracy times out', async () => {
		const fallbackPos = makePosition();
		let callCount = 0;
		const provider = new MockGeolocationProvider();
		const originalGetCurrent = provider.getCurrentPosition.bind(provider);
		jest
			.spyOn(provider, 'getCurrentPosition')
			.mockImplementation(
				(
					success: (pos: GeoPosition) => void,
					error: (err: GeoPositionError) => void,
					options?: { enableHighAccuracy?: boolean },
				) => {
					if (callCount++ === 0) {
						error(TIMEOUT_ERROR);
					} else {
						success(fallbackPos);
					}
				},
			);

		const service = new GeolocationService(provider, {
			geolocationOptions: { enableHighAccuracy: true },
		});

		const result = await service.getSingleLocationUpdate();
		expect(result).toBe(fallbackPos);
		expect(provider.getCurrentPosition).toHaveBeenCalledTimes(2);
	});
});

// ─── race-condition protection ────────────────────────────────────────────────

describe('GeolocationService – race-condition protection', () => {
	it('returns the same Promise for concurrent calls', async () => {
		let triggerSuccess: ((pos: GeoPosition) => void) | undefined;
		const provider = new MockGeolocationProvider();
		jest.spyOn(provider, 'getCurrentPosition').mockImplementation((success) => {
			triggerSuccess = success;
		});

		const service = new GeolocationService(provider);

		const p1 = service.getSingleLocationUpdate();
		const p2 = service.getSingleLocationUpdate();
		expect(p1).toBe(p2);

		triggerSuccess!(makePosition());
		await expect(p1).resolves.toBeDefined();
	});

	it('hasPendingRequest() is false initially', () => {
		const service = new GeolocationService(new MockGeolocationProvider());
		expect(service.hasPendingRequest()).toBe(false);
	});

	it('hasPendingRequest() is true while in-flight', async () => {
		let triggerSuccess: ((pos: GeoPosition) => void) | undefined;
		const provider = new MockGeolocationProvider();
		jest.spyOn(provider, 'getCurrentPosition').mockImplementation((success) => {
			triggerSuccess = success;
		});

		const service = new GeolocationService(provider);
		const req = service.getSingleLocationUpdate();

		expect(service.hasPendingRequest()).toBe(true);

		triggerSuccess!(makePosition());
		await req;

		expect(service.hasPendingRequest()).toBe(false);
	});

	it('hasPendingRequest() resets to false after a failure', async () => {
		const provider = new MockGeolocationProvider({ defaultError: MOCK_ERROR });
		const service = new GeolocationService(provider);

		await expect(service.getSingleLocationUpdate()).rejects.toBeDefined();
		expect(service.hasPendingRequest()).toBe(false);
	});

	it('allows a new request after the previous one completes', async () => {
		const pos1 = makePosition(-23.55, -46.63, 1000);
		const pos2 = makePosition(-23.56, -46.64, 2000);
		const provider = new MockGeolocationProvider({ defaultPosition: pos1 });
		const service = new GeolocationService(provider);

		const r1 = await service.getSingleLocationUpdate();
		expect(r1).toBe(pos1);

		// Flush throttle so the second call isn't served from cache
		service.flushThrottle();
		provider.setPosition(pos2);

		const r2 = await service.getSingleLocationUpdate();
		expect(r2).toBe(pos2);
	});
});

// ─── throttle – getSingleLocationUpdate ─────────────────────────────────────

describe('GeolocationService – getSingleLocationUpdate throttle', () => {
	beforeEach(() => { jest.useFakeTimers(); });
	afterEach(() => {
		jest.useRealTimers();
		jest.clearAllMocks();
	});

	// Helper: provider whose getCurrentPosition fires the callback synchronously
	// (bypasses MockGeolocationProvider's internal setTimeout so fake timers work cleanly)
	function makeSyncProvider(pos: GeoPosition): MockGeolocationProvider {
		const p = new MockGeolocationProvider({ supported: true });
		jest.spyOn(p, 'getCurrentPosition').mockImplementation((success) => success(pos));
		return p;
	}

	it('first call reaches the provider normally', async () => {
		const pos = makePosition();
		const provider = makeSyncProvider(pos);
		const service = new GeolocationService(provider);

		await service.getSingleLocationUpdate();
		expect(provider.getCurrentPosition).toHaveBeenCalledTimes(1);
	});

	it('second call within 5 s returns cached position without a new GPS fetch', async () => {
		const pos = makePosition();
		const provider = makeSyncProvider(pos);
		const service = new GeolocationService(provider);

		await service.getSingleLocationUpdate();
		jest.advanceTimersByTime(4_999);

		const cached = await service.getSingleLocationUpdate();
		expect(cached).toBe(pos);
		expect(provider.getCurrentPosition).toHaveBeenCalledTimes(1);
	});

	it('second call after 5 s triggers a new GPS fetch', async () => {
		const pos1 = makePosition(-23.55, -46.63, 1_000);
		const pos2 = makePosition(-23.56, -46.64, 6_001);
		const provider = new MockGeolocationProvider({ supported: true });
		let callCount = 0;
		jest.spyOn(provider, 'getCurrentPosition').mockImplementation((success) => {
			success(callCount++ === 0 ? pos1 : pos2);
		});
		const service = new GeolocationService(provider);

		await service.getSingleLocationUpdate();
		jest.advanceTimersByTime(5_001);

		const result = await service.getSingleLocationUpdate();
		expect(result).toBe(pos2);
		expect(provider.getCurrentPosition).toHaveBeenCalledTimes(2);
	});

	it('flushThrottle() allows an immediate second fetch', async () => {
		const pos1 = makePosition(-23.55, -46.63, 1_000);
		const pos2 = makePosition(-23.56, -46.64, 2_000);
		const provider = new MockGeolocationProvider({ supported: true });
		let callCount = 0;
		jest.spyOn(provider, 'getCurrentPosition').mockImplementation((success) => {
			success(callCount++ === 0 ? pos1 : pos2);
		});
		const service = new GeolocationService(provider);

		await service.getSingleLocationUpdate();
		jest.advanceTimersByTime(100);

		service.flushThrottle();

		const result = await service.getSingleLocationUpdate();
		expect(result).toBe(pos2);
		expect(provider.getCurrentPosition).toHaveBeenCalledTimes(2);
	});
});

// ─── throttle – watchCurrentLocation ─────────────────────────────────────────

describe('GeolocationService – watchCurrentLocation throttle', () => {
	beforeEach(() => { jest.useFakeTimers(); });
	afterEach(() => {
		jest.useRealTimers();
		jest.clearAllMocks();
	});

	function makeWatchProvider() {
		let capturedSuccess: ((pos: GeoPosition) => void) | undefined;
		const provider = new MockGeolocationProvider({ supported: true });
		jest.spyOn(provider, 'watchPosition').mockImplementation((success) => {
			capturedSuccess = success;
			return 1;
		});
		jest.spyOn(provider, 'getCurrentPosition').mockImplementation(() => {});
		const fire = (pos: GeoPosition) => capturedSuccess?.(pos);
		return { provider, fire };
	}

	it('first watch callback fires immediately', () => {
		const { provider, fire } = makeWatchProvider();
		const onUpdate = jest.fn();
		const service = new GeolocationService(provider);

		service.watchCurrentLocation(onUpdate);
		fire(makePosition());

		expect(onUpdate).toHaveBeenCalledTimes(1);
	});

	it('second watch callback within 5 s is dropped', () => {
		const { provider, fire } = makeWatchProvider();
		const onUpdate = jest.fn();
		const service = new GeolocationService(provider);

		service.watchCurrentLocation(onUpdate);
		fire(makePosition(-23.55, -46.63));
		jest.advanceTimersByTime(100);
		fire(makePosition(-23.56, -46.64)); // within window → dropped

		expect(onUpdate).toHaveBeenCalledTimes(1);
	});

	it('watch callback after 5 s is forwarded', () => {
		const { provider, fire } = makeWatchProvider();
		const onUpdate = jest.fn();
		const service = new GeolocationService(provider);

		service.watchCurrentLocation(onUpdate);
		fire(makePosition(-23.55, -46.63));
		jest.advanceTimersByTime(5_001);
		fire(makePosition(-23.56, -46.64)); // past window → forwarded

		expect(onUpdate).toHaveBeenCalledTimes(2);
	});

	it('flushThrottle() resets the watch handler cooldown', () => {
		const { provider, fire } = makeWatchProvider();
		const onUpdate = jest.fn();
		const service = new GeolocationService(provider);

		service.watchCurrentLocation(onUpdate);
		fire(makePosition());
		jest.advanceTimersByTime(100);

		service.flushThrottle();
		fire(makePosition(-23.56, -46.64)); // cooldown reset → forwarded

		expect(onUpdate).toHaveBeenCalledTimes(2);
	});

	it('setThrottleInterval(2000) throttles within 2 s', () => {
		const { provider, fire } = makeWatchProvider();
		const onUpdate = jest.fn();
		const service = new GeolocationService(provider);

		service.watchCurrentLocation(onUpdate);
		service.setThrottleInterval(2_000);

		fire(makePosition());
		jest.advanceTimersByTime(1_000);
		fire(makePosition(-23.56, -46.64)); // within 2 s → dropped

		expect(onUpdate).toHaveBeenCalledTimes(1);
	});

	it('setThrottleInterval(2000) allows events after 2 s', () => {
		const { provider, fire } = makeWatchProvider();
		const onUpdate = jest.fn();
		const service = new GeolocationService(provider);

		service.watchCurrentLocation(onUpdate);
		service.setThrottleInterval(2_000);

		fire(makePosition());
		jest.advanceTimersByTime(2_001);
		fire(makePosition(-23.56, -46.64)); // past 2 s → forwarded

		expect(onUpdate).toHaveBeenCalledTimes(2);
	});

	it('setThrottleInterval restores 5 s behaviour after downgrade', () => {
		const { provider, fire } = makeWatchProvider();
		const onUpdate = jest.fn();
		const service = new GeolocationService(provider);

		service.watchCurrentLocation(onUpdate);
		service.setThrottleInterval(2_000);
		service.setThrottleInterval(5_000);

		fire(makePosition());
		jest.advanceTimersByTime(2_001);
		fire(makePosition(-23.56, -46.64)); // within 5 s → dropped

		expect(onUpdate).toHaveBeenCalledTimes(1);
	});
});

// ─── watchCurrentLocation lifecycle ─────────────────────────────────────────

describe('GeolocationService – watchCurrentLocation lifecycle', () => {
	it('starts watching and returns a watch ID', () => {
		const pos = makePosition();
		const provider = new MockGeolocationProvider({ defaultPosition: pos });
		const service = new GeolocationService(provider);

		const watchId = service.watchCurrentLocation();

		expect(watchId).not.toBeNull();
		expect(service.isCurrentlyWatching()).toBe(true);
	});

	it('returns null when provider is unsupported', () => {
		const provider = new MockGeolocationProvider({ supported: false });
		const service = new GeolocationService(provider);

		expect(service.watchCurrentLocation()).toBeNull();
	});

	it('returns the existing watch ID if already watching', () => {
		const provider = new MockGeolocationProvider({ defaultPosition: makePosition() });
		const service = new GeolocationService(provider);

		const id1 = service.watchCurrentLocation();
		const id2 = service.watchCurrentLocation();

		expect(id1).toBe(id2);
	});

	it('stopWatching() ends the watch and resets state', () => {
		const provider = new MockGeolocationProvider({ defaultPosition: makePosition() });
		const spy = jest.spyOn(provider, 'clearWatch');
		const service = new GeolocationService(provider);

		const watchId = service.watchCurrentLocation()!;
		service.stopWatching();

		expect(spy).toHaveBeenCalledWith(watchId);
		expect(service.isCurrentlyWatching()).toBe(false);
		expect(service.getCurrentWatchId()).toBeNull();
	});

	it('swallows timeout errors from the watch (code 3)', () => {
		const provider = new MockGeolocationProvider({ defaultPosition: makePosition() });
		const onError = jest.fn();
		const service = new GeolocationService(provider);

		service.watchCurrentLocation(undefined, onError);
		provider.triggerWatchError(TIMEOUT_ERROR);

		expect(onError).not.toHaveBeenCalled();
	});

	it('forwards non-timeout errors from the watch', () => {
		const provider = new MockGeolocationProvider({ defaultPosition: makePosition() });
		const onError = jest.fn();
		const service = new GeolocationService(provider);

		service.watchCurrentLocation(undefined, onError);
		provider.triggerWatchError(MOCK_ERROR);

		expect(onError).toHaveBeenCalledWith(MOCK_ERROR);
	});

	it('receives live updates via onUpdate callback', async () => {
		const pos1 = makePosition(-23.55, -46.63);
		const pos2 = makePosition(-23.56, -46.64);
		const provider = new MockGeolocationProvider({ defaultPosition: pos1 });
		const onUpdate = jest.fn();
		const service = new GeolocationService(provider);

		service.watchCurrentLocation(onUpdate);

		await Promise.resolve(); // let MockGeolocationProvider schedule initial callback

		service.flushThrottle();
		provider.triggerWatchUpdate(pos2);

		expect(onUpdate).toHaveBeenCalledWith(pos2);
	});
});

// ─── checkPermissions ─────────────────────────────────────────────────────────

describe('GeolocationService – checkPermissions', () => {
	it('returns "prompt" when provider has no navigator', async () => {
		const provider = new MockGeolocationProvider();
		const service = new GeolocationService(provider);

		// MockGeolocationProvider has no getNavigator() → no Permissions API → 'prompt'
		const result = await service.checkPermissions();
		expect(result).toBe('prompt');
	});

	it('returns the Permissions API state when BrowserGeolocationProvider is used with a mock navigator', async () => {
		const mockPermissions = {
		query: jest.fn().mockImplementation(() => Promise.resolve({ state: 'granted' })),
		};
		const mockNavigator = {
			geolocation: {
				getCurrentPosition: jest.fn(),
				watchPosition: jest.fn(() => 1),
				clearWatch: jest.fn(),
			},
			permissions: mockPermissions,
		} as unknown as Navigator;

		const provider = new BrowserGeolocationProvider(mockNavigator);
		const service = new GeolocationService(provider);

		const result = await service.checkPermissions();
		expect(result).toBe('granted');
		expect(mockPermissions.query).toHaveBeenCalledWith({ name: 'geolocation' });
	});

	it('falls back to "prompt" when Permissions API throws', async () => {
		const mockNavigator = {
			geolocation: {},
			permissions: {
				query: jest.fn().mockImplementation(() => Promise.reject(new Error('not supported'))),
			},
		} as unknown as Navigator;

		const provider = new BrowserGeolocationProvider(mockNavigator);
		const service = new GeolocationService(provider);

		const result = await service.checkPermissions();
		expect(result).toBe('prompt');
	});
});

// ─── provider integration ─────────────────────────────────────────────────────

describe('GeolocationService – provider integration', () => {
	it('works end-to-end with MockGeolocationProvider', async () => {
		const pos = makePosition();
		let mockProvider: MockGeolocationProvider | null = null;
		try {
			mockProvider = new MockGeolocationProvider({ defaultPosition: pos });
			const service = new GeolocationService(mockProvider);

			const position = await service.getSingleLocationUpdate();
			expect(position).toBe(pos);
			expect(service.getLastKnownPosition()).toBe(pos);

			service.flushThrottle();
			const watchId = service.watchCurrentLocation();
			expect(watchId).not.toBeNull();
			expect(service.isCurrentlyWatching()).toBe(true);

			service.stopWatching();
			expect(service.isCurrentlyWatching()).toBe(false);
		} finally {
			mockProvider?.destroy();
		}
	});

	it('works with BrowserGeolocationProvider wrapping a mock navigator', async () => {
		const pos = makePosition();
		const mockNavigator = {
			geolocation: {
				getCurrentPosition: jest.fn((success: PositionCallback) =>
					success(pos as unknown as GeolocationPosition),
				),
				watchPosition: jest.fn(() => 42),
				clearWatch: jest.fn(),
			},
		} as unknown as Navigator;

		const provider = new BrowserGeolocationProvider(mockNavigator);
		const service = new GeolocationService(provider);

		const result = await service.getSingleLocationUpdate();
		expect(result).toBe(pos);
	});

	it('verifies MockGeolocationProvider implements the GeolocationProvider port', () => {
		const provider = new MockGeolocationProvider();
		expect(typeof provider.getCurrentPosition).toBe('function');
		expect(typeof provider.watchPosition).toBe('function');
		expect(typeof provider.clearWatch).toBe('function');
		expect(typeof provider.isSupported).toBe('function');
	});
});
