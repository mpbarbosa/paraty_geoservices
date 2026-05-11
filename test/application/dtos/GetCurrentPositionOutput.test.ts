import type { GetCurrentPositionOutput } from './GetCurrentPositionOutput';

describe('GetCurrentPositionOutput DTO', () => {
  const mockGeoPosition = {
    coords: {
      latitude: 12.34,
      longitude: 56.78,
      altitude: 100,
      accuracy: 5,
      altitudeAccuracy: 1,
      heading: 90,
      speed: 10,
    },
    timestamp: 1620000000000,
  };

  it('should accept a valid GeoPosition object', () => {
    const output: GetCurrentPositionOutput = { position: mockGeoPosition as any };
    expect(output.position).toBe(mockGeoPosition);
  });

  it('should throw a type error if position is missing', () => {
    // @ts-expect-error
    expect(() => {
      const output: GetCurrentPositionOutput = {};
    }).toThrow();
  });

  it('should throw a type error if position is null', () => {
    // @ts-expect-error
    expect(() => {
      const output: GetCurrentPositionOutput = { position: null };
    }).toThrow();
  });

  it('should allow extra properties on position if GeoPosition type is compatible', () => {
    const extendedGeoPosition = { ...mockGeoPosition, extra: 'value' };
    const output: GetCurrentPositionOutput = { position: extendedGeoPosition as any };
    expect(output.position.extra).toBe('value');
  });
});
