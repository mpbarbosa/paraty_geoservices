/**
 * Unit tests for GetCurrentPositionUseCase.
 *
 * @module application/use-cases/GetCurrentPositionUseCase.test
 */

import { GetCurrentPositionUseCase } from './GetCurrentPositionUseCase';
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

const MOCK_ERROR: GeoPositionError = { code: 1, message: 'Permission denied' };
const MOCK_OPTIONS: GeoPositionOptions = { enableHighAccuracy: true, timeout: 5000 };

// ---------------------------------------------------------------------------
// Test double
// ---------------------------------------------------------------------------

class SuccessProvider extends GeolocationProvider {
	getCurrentPosition(success: (pos: GeoPosition) => void): void {
		success(MOCK_POSITION);
	}
	watchPosition(): number { return 1; }
	clearWatch(): void {}
	isSupported(): boolean { return true; }
}

class FailureProvider extends GeolocationProvider {
	getCurrentPosition(_: unknown, error: (err: GeoPositionError) => void): void {
		error(MOCK_ERROR);
	}
	watchPosition(): null { return null; }
	clearWatch(): void {}
	isSupported(): boolean { return false; }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GetCurrentPositionUseCase', () => {
	it('resolves with an output containing the acquired position', async () => {
		const useCase = new GetCurrentPositionUseCase(new SuccessProvider());

		const output = await useCase.execute();

		expect(output.position).toEqual(MOCK_POSITION);
	});

	it('resolves with position when options are provided', async () => {
		const useCase = new GetCurrentPositionUseCase(new SuccessProvider());

		const output = await useCase.execute(MOCK_OPTIONS);

		expect(output.position).toEqual(MOCK_POSITION);
	});

	it('rejects with the provider error when acquisition fails', async () => {
		const useCase = new GetCurrentPositionUseCase(new FailureProvider());

		await expect(useCase.execute()).rejects.toEqual(MOCK_ERROR);
	});

	it('forwards options to the provider', async () => {
		const spy = jest.fn(
			(success: (pos: GeoPosition) => void, _err: unknown, _opts?: GeoPositionOptions) =>
				success(MOCK_POSITION),
		);

		class SpyProvider extends GeolocationProvider {
			getCurrentPosition(
				success: (pos: GeoPosition) => void,
				_error: (err: GeoPositionError) => void,
				options?: GeoPositionOptions,
			): void {
				spy(success, _error, options);
				success(MOCK_POSITION);
			}
			watchPosition(): null { return null; }
			clearWatch(): void {}
			isSupported(): boolean { return true; }
		}

		const useCase = new GetCurrentPositionUseCase(new SpyProvider());
		await useCase.execute(MOCK_OPTIONS);

		expect(spy).toHaveBeenCalledWith(
			expect.any(Function),
			expect.any(Function),
			MOCK_OPTIONS,
		);
	});
});
