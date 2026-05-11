/**
 * Unit tests for GeolocationProvider abstract base class (domain port).
 *
 * Strategy: instantiate concrete test doubles that extend GeolocationProvider,
 * exercising every method and both the happy-path and error branches.
 *
 * @module domain/ports/GeolocationProvider.test
 */

import GeolocationProvider, {
	GeoPosition,
	GeoPositionError,
	GeoPositionOptions,
} from './GeolocationProvider';

// ---------------------------------------------------------------------------
// Shared test fixtures
// ---------------------------------------------------------------------------

const MOCK_POSITION: GeoPosition = {
	coords: {
		latitude: -23.3045,
		longitude: -44.7213,
		accuracy: 10,
		altitude: 5,
		altitudeAccuracy: 3,
		heading: 90,
		speed: 1.5,
	},
	timestamp: 1_700_000_000_000,
};

const MOCK_ERROR: GeoPositionError = {
	code: 1,
	message: 'User denied geolocation',
};

const MOCK_OPTIONS: GeoPositionOptions = {
	enableHighAccuracy: true,
	timeout: 5000,
	maximumAge: 0,
};

// ---------------------------------------------------------------------------
// Concrete implementations used only in tests
// ---------------------------------------------------------------------------

/** A fully functional provider for happy-path tests. */
class SupportedProvider extends GeolocationProvider {
	private nextWatchId = 1;
	private activeWatches = new Set<number>();

	getCurrentPosition(
		successCallback: (pos: GeoPosition) => void,
		_errorCallback: (err: GeoPositionError) => void,
		_options?: GeoPositionOptions,
	): void {
		successCallback(MOCK_POSITION);
	}

	watchPosition(
		successCallback: (pos: GeoPosition) => void,
		_errorCallback: (err: GeoPositionError) => void,
		_options?: GeoPositionOptions,
	): number {
		const id = this.nextWatchId++;
		this.activeWatches.add(id);
		successCallback(MOCK_POSITION);
		return id;
	}

	clearWatch(watchId: number): void {
		this.activeWatches.delete(watchId);
	}

	isSupported(): boolean {
		return true;
	}

	/** Exposes internal state for assertions. */
	hasActiveWatch(watchId: number): boolean {
		return this.activeWatches.has(watchId);
	}
}

/** A provider that always fails, simulating an unavailable location service. */
class UnsupportedProvider extends GeolocationProvider {
	getCurrentPosition(
		_successCallback: (pos: GeoPosition) => void,
		errorCallback: (err: GeoPositionError) => void,
		_options?: GeoPositionOptions,
	): void {
		errorCallback(MOCK_ERROR);
	}

	watchPosition(
		_successCallback: (pos: GeoPosition) => void,
		errorCallback: (err: GeoPositionError) => void,
		_options?: GeoPositionOptions,
	): null {
		errorCallback(MOCK_ERROR);
		return null;
	}

	clearWatch(_watchId: number): void {
		// no-op: nothing to clear
	}

	isSupported(): boolean {
		return false;
	}
}

/** A provider that invokes the error callback on every call. */
class ErrorProvider extends GeolocationProvider {
	private readonly error: GeoPositionError = {
		code: 2,
		message: 'Position unavailable',
	};

	getCurrentPosition(
		_successCallback: (pos: GeoPosition) => void,
		errorCallback: (err: GeoPositionError) => void,
		_options?: GeoPositionOptions,
	): void {
		errorCallback(this.error);
	}

	watchPosition(
		_successCallback: (pos: GeoPosition) => void,
		errorCallback: (err: GeoPositionError) => void,
		_options?: GeoPositionOptions,
	): null {
		errorCallback(this.error);
		return null;
	}

	clearWatch(_watchId: number): void {
		// no-op
	}

	isSupported(): boolean {
		return true;
	}
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GeolocationProvider (abstract base class / domain port)', () => {
	describe('isSupported()', () => {
		it('returns true when the provider reports support', () => {
			const provider = new SupportedProvider();
			expect(provider.isSupported()).toBe(true);
		});

		it('returns false when the provider reports no support', () => {
			const provider = new UnsupportedProvider();
			expect(provider.isSupported()).toBe(false);
		});
	});

	describe('getCurrentPosition()', () => {
		it('invokes successCallback with the acquired position', () => {
			const provider = new SupportedProvider();
			const onSuccess = jest.fn();
			const onError = jest.fn();

			provider.getCurrentPosition(onSuccess, onError, MOCK_OPTIONS);

			expect(onSuccess).toHaveBeenCalledTimes(1);
			expect(onSuccess).toHaveBeenCalledWith(MOCK_POSITION);
			expect(onError).not.toHaveBeenCalled();
		});

		it('invokes errorCallback when position acquisition fails', () => {
			const provider = new UnsupportedProvider();
			const onSuccess = jest.fn();
			const onError = jest.fn();

			provider.getCurrentPosition(onSuccess, onError, MOCK_OPTIONS);

			expect(onError).toHaveBeenCalledTimes(1);
			expect(onError).toHaveBeenCalledWith(MOCK_ERROR);
			expect(onSuccess).not.toHaveBeenCalled();
		});

		it('passes position data with all required coordinate fields', () => {
			const provider = new SupportedProvider();
			let receivedPosition: GeoPosition | undefined;

			provider.getCurrentPosition(
				(pos) => { receivedPosition = pos; },
				jest.fn(),
			);

			expect(receivedPosition).toBeDefined();
			expect(typeof receivedPosition!.coords.latitude).toBe('number');
			expect(typeof receivedPosition!.coords.longitude).toBe('number');
			expect(typeof receivedPosition!.coords.accuracy).toBe('number');
			expect(typeof receivedPosition!.timestamp).toBe('number');
		});

		it('works without the optional options argument', () => {
			const provider = new SupportedProvider();
			const onSuccess = jest.fn();

			expect(() => {
				provider.getCurrentPosition(onSuccess, jest.fn());
			}).not.toThrow();

			expect(onSuccess).toHaveBeenCalledTimes(1);
		});

		it('propagates error code and message on failure', () => {
			const provider = new ErrorProvider();
			let receivedError: GeoPositionError | undefined;

			provider.getCurrentPosition(
				jest.fn(),
				(err) => { receivedError = err; },
			);

			expect(receivedError).toBeDefined();
			expect(receivedError!.code).toBe(2);
			expect(receivedError!.message).toBe('Position unavailable');
		});
	});

	describe('watchPosition()', () => {
		it('returns a numeric watch ID when the provider is supported', () => {
			const provider = new SupportedProvider();

			const watchId = provider.watchPosition(jest.fn(), jest.fn(), MOCK_OPTIONS);

			expect(typeof watchId).toBe('number');
			expect(watchId).toBeGreaterThan(0);
		});

		it('returns null when the provider does not support watching', () => {
			const provider = new UnsupportedProvider();

			const watchId = provider.watchPosition(jest.fn(), jest.fn(), MOCK_OPTIONS);

			expect(watchId).toBeNull();
		});

		it('invokes successCallback on the first position update', () => {
			const provider = new SupportedProvider();
			const onSuccess = jest.fn();

			provider.watchPosition(onSuccess, jest.fn(), MOCK_OPTIONS);

			expect(onSuccess).toHaveBeenCalledTimes(1);
			expect(onSuccess).toHaveBeenCalledWith(MOCK_POSITION);
		});

		it('invokes errorCallback when watching fails', () => {
			const provider = new UnsupportedProvider();
			const onError = jest.fn();

			provider.watchPosition(jest.fn(), onError, MOCK_OPTIONS);

			expect(onError).toHaveBeenCalledTimes(1);
			expect(onError).toHaveBeenCalledWith(MOCK_ERROR);
		});

		it('produces unique watch IDs on successive calls', () => {
			const provider = new SupportedProvider();

			const id1 = provider.watchPosition(jest.fn(), jest.fn());
			const id2 = provider.watchPosition(jest.fn(), jest.fn());

			expect(id1).not.toBe(id2);
		});

		it('works without the optional options argument', () => {
			const provider = new SupportedProvider();
			const onSuccess = jest.fn();

			expect(() => {
				provider.watchPosition(onSuccess, jest.fn());
			}).not.toThrow();

			expect(onSuccess).toHaveBeenCalledTimes(1);
		});
	});

	describe('clearWatch()', () => {
		it('removes an active watch by its ID', () => {
			const provider = new SupportedProvider();

			const watchId = provider.watchPosition(jest.fn(), jest.fn()) as number;
			expect(provider.hasActiveWatch(watchId)).toBe(true);

			provider.clearWatch(watchId);
			expect(provider.hasActiveWatch(watchId)).toBe(false);
		});

		it('does not throw when called with an unknown watch ID', () => {
			const provider = new SupportedProvider();

			expect(() => provider.clearWatch(9999)).not.toThrow();
		});

		it('clears only the specified watch, leaving others intact', () => {
			const provider = new SupportedProvider();

			const id1 = provider.watchPosition(jest.fn(), jest.fn()) as number;
			const id2 = provider.watchPosition(jest.fn(), jest.fn()) as number;

			provider.clearWatch(id1);

			expect(provider.hasActiveWatch(id1)).toBe(false);
			expect(provider.hasActiveWatch(id2)).toBe(true);
		});
	});

	describe('TypeScript contract', () => {
		it('concrete subclass is an instance of GeolocationProvider', () => {
			const provider = new SupportedProvider();
			expect(provider).toBeInstanceOf(GeolocationProvider);
		});

		it('supports the named export alongside the default export', () => {
			// Both default and named export must reference the same constructor.
			const { GeolocationProvider: Named } = require('./GeolocationProvider');
			expect(Named).toBe(GeolocationProvider);
		});
	});
});
