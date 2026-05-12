/**
 * Integration tests for MockGeolocationProvider.
 *
 * Verifies deterministic success/error responses, watch lifecycle behaviour,
 * delayed callbacks, use-case integration, and the public package export.
 *
 * @module test/infrastructure/providers/MockGeolocationProvider.test
 */

import { GetCurrentPositionUseCase } from '../../../src/application/use-cases/GetCurrentPositionUseCase';
import { WatchPositionUseCase } from '../../../src/application/use-cases/WatchPositionUseCase';
import { GeolocationProvider } from '../../../src/domain/ports/GeolocationProvider';
import type { GeoPosition } from '../../../src/domain/entities/GeoPosition';
import type { GeoPositionError } from '../../../src/domain/entities/GeoPositionError';
import { MockGeolocationProvider } from '../../../src/infrastructure/providers/MockGeolocationProvider';
import { MockGeolocationProvider as PublicMockGeolocationProvider } from '../../../src';

const createPosition = (overrides: Partial<GeoPosition> = {}): GeoPosition => ({
  coords: {
    latitude: -23.5505,
    longitude: -46.6333,
    accuracy: 10,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
    ...(overrides.coords ?? {}),
  },
  timestamp: overrides.timestamp ?? Date.now(),
});

const createError = (overrides: Partial<GeoPositionError> = {}): GeoPositionError => ({
  code: overrides.code ?? 1,
  message: overrides.message ?? 'Permission denied',
});

describe('MockGeolocationProvider', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('constructor and capability helpers', () => {
    it('should default to supported geolocation and no configured data', () => {
      const provider = new MockGeolocationProvider();

      expect(provider.isSupported()).toBe(true);
      expect(provider.isPermissionsAPISupported()).toBe(false);
      expect(provider).toBeInstanceOf(GeolocationProvider);
    });

    it('should accept a custom unsupported configuration', () => {
      const provider = new MockGeolocationProvider({ supported: false, delay: 25 });

      expect(provider.isSupported()).toBe(false);

      const onError = jest.fn();
      provider.getCurrentPosition(jest.fn(), onError);
      jest.advanceTimersByTime(25);

      expect(onError).toHaveBeenCalledWith({
        code: 2,
        message: 'Geolocation is not supported',
      });
    });
  });

  describe('getCurrentPosition', () => {
    it('should resolve with the configured default position', () => {
      const position = createPosition();
      const provider = new MockGeolocationProvider({ defaultPosition: position });
      const onSuccess = jest.fn();
      const onError = jest.fn();

      provider.getCurrentPosition(onSuccess, onError);
      jest.runAllTimers();

      expect(onSuccess).toHaveBeenCalledWith(position);
      expect(onError).not.toHaveBeenCalled();
    });

    it('should surface the configured default error', () => {
      const error = createError();
      const provider = new MockGeolocationProvider({ defaultError: error });
      const onSuccess = jest.fn();
      const onError = jest.fn();

      provider.getCurrentPosition(onSuccess, onError);
      jest.runAllTimers();

      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(error);
    });

    it('should report position unavailable when nothing is configured', () => {
      const provider = new MockGeolocationProvider();
      const onError = jest.fn();

      provider.getCurrentPosition(jest.fn(), onError);
      jest.runAllTimers();

      expect(onError).toHaveBeenCalledWith({
        code: 2,
        message: 'Position unavailable',
      });
    });

    it('should respect the configured delay before invoking callbacks', () => {
      const provider = new MockGeolocationProvider({
        defaultPosition: createPosition(),
        delay: 50,
      });
      const onSuccess = jest.fn();

      provider.getCurrentPosition(onSuccess, jest.fn());

      jest.advanceTimersByTime(49);
      expect(onSuccess).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1);
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  describe('watchPosition and watch lifecycle', () => {
    it('should return incrementing watch ids and emit the configured position asynchronously', () => {
      const position = createPosition();
      const provider = new MockGeolocationProvider({ defaultPosition: position });
      const firstSuccess = jest.fn();
      const secondSuccess = jest.fn();

      const firstWatchId = provider.watchPosition(firstSuccess, jest.fn());
      const secondWatchId = provider.watchPosition(secondSuccess, jest.fn());

      expect(firstWatchId).toBe(1);
      expect(secondWatchId).toBe(2);

      jest.runAllTimers();

      expect(firstSuccess).toHaveBeenCalledWith(position);
      expect(secondSuccess).toHaveBeenCalledWith(position);
    });

    it('should return null when geolocation is unsupported', () => {
      const provider = new MockGeolocationProvider({ supported: false });

      expect(provider.watchPosition(jest.fn(), jest.fn())).toBeNull();
    });

    it('should not emit a scheduled initial callback after the watch is cleared', () => {
      const provider = new MockGeolocationProvider({
        defaultPosition: createPosition(),
        delay: 10,
      });
      const onSuccess = jest.fn();

      const watchId = provider.watchPosition(onSuccess, jest.fn());
      expect(watchId).toBe(1);

      provider.clearWatch(1);
      jest.runAllTimers();

      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should fan out manual updates and errors to all active watches', () => {
      const provider = new MockGeolocationProvider();
      const position = createPosition({ coords: { latitude: -22.9068 } as GeoPosition['coords'] });
      const error = createError({ code: 3, message: 'Timeout' });
      const onSuccessA = jest.fn();
      const onSuccessB = jest.fn();
      const onErrorA = jest.fn();
      const onErrorB = jest.fn();

      provider.watchPosition(onSuccessA, onErrorA);
      provider.watchPosition(onSuccessB, onErrorB);
      jest.clearAllMocks();

      provider.triggerWatchUpdate(position);
      provider.triggerWatchError(error);

      expect(onSuccessA).toHaveBeenCalledWith(position);
      expect(onSuccessB).toHaveBeenCalledWith(position);
      expect(onErrorA).toHaveBeenCalledWith(error);
      expect(onErrorB).toHaveBeenCalledWith(error);
    });
  });

  describe('mutation helpers', () => {
    it('should let setPosition override the configured error state', () => {
      const provider = new MockGeolocationProvider({ defaultError: createError() });
      const position = createPosition();
      const onSuccess = jest.fn();
      const onError = jest.fn();

      provider.setPosition(position);
      provider.getCurrentPosition(onSuccess, onError);
      jest.runAllTimers();

      expect(onSuccess).toHaveBeenCalledWith(position);
      expect(onError).not.toHaveBeenCalled();
    });

    it('should let setError override the configured position state', () => {
      const provider = new MockGeolocationProvider({ defaultPosition: createPosition() });
      const error = createError({ code: 3, message: 'Timeout' });
      const onSuccess = jest.fn();
      const onError = jest.fn();

      provider.setError(error);
      provider.getCurrentPosition(onSuccess, onError);
      jest.runAllTimers();

      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  describe('destroy', () => {
    it('should cancel pending callbacks and clear watch state', () => {
      const provider = new MockGeolocationProvider({
        defaultPosition: createPosition(),
        delay: 100,
      });
      const onSuccess = jest.fn();

      provider.getCurrentPosition(onSuccess, jest.fn());
      provider.watchPosition(onSuccess, jest.fn());
      provider.destroy();
      jest.runAllTimers();

      provider.triggerWatchUpdate(createPosition({ coords: { longitude: -43.1729 } as GeoPosition['coords'] }));

      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('use-case integration', () => {
    it('should work with GetCurrentPositionUseCase', async () => {
      const position = createPosition();
      const provider = new MockGeolocationProvider({ defaultPosition: position });
      const useCase = new GetCurrentPositionUseCase(provider);

      const outputPromise = useCase.execute();
      jest.runAllTimers();

      await expect(outputPromise).resolves.toEqual({ position });
    });

    it('should work with WatchPositionUseCase', () => {
      const position = createPosition();
      const provider = new MockGeolocationProvider({ defaultPosition: position });
      const useCase = new WatchPositionUseCase(provider);
      const onUpdate = jest.fn();
      const onError = jest.fn();

      useCase.start(onUpdate, onError);
      jest.runAllTimers();

      expect(onUpdate).toHaveBeenCalledWith(position);
      expect(onError).not.toHaveBeenCalled();

      useCase.stop();
      jest.clearAllMocks();
      provider.triggerWatchUpdate(position);

      expect(onUpdate).not.toHaveBeenCalled();
    });
  });

  describe('public entry point', () => {
    it('should export MockGeolocationProvider from the package entry point', () => {
      expect(PublicMockGeolocationProvider).toBe(MockGeolocationProvider);
    });
  });
});
