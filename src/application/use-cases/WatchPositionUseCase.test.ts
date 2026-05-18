/**
 * Unit tests for WatchPositionUseCase.
 *
 * @module application/use-cases/WatchPositionUseCase.test
 */

import { WatchPositionUseCase } from './WatchPositionUseCase';
import GeolocationProvider from '../../domain/ports/GeolocationProvider';
import type { GeoPosition, GeoPositionError, GeoPositionOptions } from '../../domain/ports/GeolocationProvider';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_POSITION: GeoPosition = {
	coords: {
		latitude: -23.3045,
		longitude: -44.7213,
		accuracy: 10,
		altitude: null,
		altitudeAccuracy: null,
		heading: null,
		speed: null,
	},
	timestamp: 1_700_000_000_000,
};

const MOCK_ERROR: GeoPositionError = { code: 2, message: 'Position unavailable' };

// ---------------------------------------------------------------------------
// Test double
// ---------------------------------------------------------------------------

class TrackingProvider extends GeolocationProvider {
	private nextId = 1;
	private activeWatches = new Set<number>();
	lastIssuedId = 0;

	getCurrentPosition(success: (pos: GeoPosition) => void): void {
		success(MOCK_POSITION);
	}

	watchPosition(
		success: (pos: GeoPosition) => void,
		_error: (err: GeoPositionError) => void,
		_options?: GeoPositionOptions,
	): number {
		const id = this.nextId++;
		this.lastIssuedId = id;
		this.activeWatches.add(id);
		success(MOCK_POSITION);
		return id;
	}

	clearWatch(watchId: number): void {
		this.activeWatches.delete(watchId);
	}

	isSupported(): boolean { return true; }

	hasActiveWatch(id: number): boolean {
		return this.activeWatches.has(id);
	}
}

class ErrorProvider extends GeolocationProvider {
	getCurrentPosition(_: unknown, error: (err: GeoPositionError) => void): void {
		error(MOCK_ERROR);
	}
	watchPosition(_: unknown, error: (err: GeoPositionError) => void): null {
		error(MOCK_ERROR);
		return null;
	}
	clearWatch(): void {}
	isSupported(): boolean { return true; }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('WatchPositionUseCase', () => {
	describe('start()', () => {
		it('invokes onUpdate callback with the first position', () => {
			const provider = new TrackingProvider();
			const onUpdate = jest.fn();

			new WatchPositionUseCase(provider).start(onUpdate, jest.fn());

			expect(onUpdate).toHaveBeenCalledTimes(1);
			expect(onUpdate).toHaveBeenCalledWith(MOCK_POSITION);
		});

		it('invokes onError callback when the provider fails', () => {
			const onError = jest.fn();

			new WatchPositionUseCase(new ErrorProvider()).start(jest.fn(), onError);

			expect(onError).toHaveBeenCalledTimes(1);
			expect(onError).toHaveBeenCalledWith(MOCK_ERROR);
		});

		it('sets isWatching to true after starting', () => {
			const useCase = new WatchPositionUseCase(new TrackingProvider());
			expect(useCase.isWatching).toBe(false);

			useCase.start(jest.fn(), jest.fn());
			expect(useCase.isWatching).toBe(true);
		});

		it('stops the previous watch before starting a new one', () => {
			const provider = new TrackingProvider();
			const useCase = new WatchPositionUseCase(provider);

			useCase.start(jest.fn(), jest.fn());
			const firstWatchId = provider.lastIssuedId;
			expect(provider.hasActiveWatch(firstWatchId)).toBe(true);

			useCase.start(jest.fn(), jest.fn());
			expect(provider.hasActiveWatch(firstWatchId)).toBe(false);
		});
	});

	describe('stop()', () => {
		it('clears the active watch and sets isWatching to false', () => {
			const provider = new TrackingProvider();
			const useCase = new WatchPositionUseCase(provider);

			useCase.start(jest.fn(), jest.fn());
			const watchId = provider.lastIssuedId;
			expect(provider.hasActiveWatch(watchId)).toBe(true);

			useCase.stop();

			expect(provider.hasActiveWatch(watchId)).toBe(false);
			expect(useCase.isWatching).toBe(false);
		});

		it('does not throw when called without an active watch', () => {
			const useCase = new WatchPositionUseCase(new TrackingProvider());
			expect(() => useCase.stop()).not.toThrow();
		});
	});

	describe('isWatching', () => {
		let useCase: WatchPositionUseCase;

		beforeEach(() => {
			useCase = new WatchPositionUseCase(new TrackingProvider());
		});

		it('is false before start() is called', () => {
			expect(useCase.isWatching).toBe(false);
		});

		it('is false after stop() is called', () => {
			useCase.start(jest.fn(), jest.fn());
			useCase.stop();
			expect(useCase.isWatching).toBe(false);
		});
	});
});
