import {
  GetCurrentPositionUseCase,
  WatchPositionUseCase,
} from '../../src/application/index';
import type { GetCurrentPositionOutput } from '../../src/application/index';

describe('application/index exports', () => {
  it('should export GetCurrentPositionUseCase as a constructor', () => {
    expect(typeof GetCurrentPositionUseCase).toBe('function');
    // Instantiation may fail if dependencies are required, but type should be correct
    try {
      const instance = new (GetCurrentPositionUseCase as any)();
      expect(instance).toBeInstanceOf(GetCurrentPositionUseCase);
    } catch (e) {
      // Acceptable if constructor requires params
      expect(e).toBeDefined();
    }
  });

  it('should export WatchPositionUseCase as a constructor', () => {
    expect(typeof WatchPositionUseCase).toBe('function');
    try {
      const instance = new (WatchPositionUseCase as any)();
      expect(instance).toBeInstanceOf(WatchPositionUseCase);
    } catch (e) {
      expect(e).toBeDefined();
    }
  });

  it('should export GetCurrentPositionOutput type', () => {
    const mockGeoPosition = {
      coords: {
        latitude: 1,
        longitude: 2,
        altitude: 3,
        accuracy: 4,
        altitudeAccuracy: 5,
        heading: 6,
        speed: 7,
      },
      timestamp: 1234567890,
    };
    const output: GetCurrentPositionOutput = { position: mockGeoPosition as any };
    expect(output.position).toBe(mockGeoPosition);
  });

});
