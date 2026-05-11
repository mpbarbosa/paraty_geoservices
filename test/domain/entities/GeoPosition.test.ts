import type { GeoPosition } from '../../../src/domain/entities/GeoPosition';

describe('GeoPosition interface', () => {
  it('should accept a valid GeoPosition object with all properties', () => {
    const geo: GeoPosition = {
      coords: {
        latitude: 10.123,
        longitude: 20.456,
        accuracy: 5,
        altitude: 100,
        altitudeAccuracy: 1,
        heading: 90,
        speed: 10,
      },
      timestamp: 1620000000000,
    };
    expect(geo.coords.latitude).toBe(10.123);
    expect(geo.coords.longitude).toBe(20.456);
    expect(geo.timestamp).toBe(1620000000000);
  });

  it('should allow null for altitude, altitudeAccuracy, heading, and speed', () => {
    const geo: GeoPosition = {
      coords: {
        latitude: 0,
        longitude: 0,
        accuracy: 1,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: 0,
    };
    expect(geo.coords.altitude).toBeNull();
    expect(geo.coords.altitudeAccuracy).toBeNull();
    expect(geo.coords.heading).toBeNull();
    expect(geo.coords.speed).toBeNull();
  });

  it('should allow extra properties on coords if type compatible', () => {
    const geo: GeoPosition = {
      coords: {
        latitude: 1,
        longitude: 2,
        accuracy: 3,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
        extra: 'foo',
      } as any,
      timestamp: 1,
    };
    expect((geo.coords as any).extra).toBe('foo');
  });
});
