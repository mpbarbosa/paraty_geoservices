import type { GetCurrentPositionOutput } from '../../../src/application/dtos/index';

describe('dtos/index exports', () => {
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
