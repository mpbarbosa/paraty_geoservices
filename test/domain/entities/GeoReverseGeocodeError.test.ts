import type { GeoReverseGeocodeError } from '../../../src/domain/entities/GeoReverseGeocodeError';
import { createGeoReverseGeocodeError } from '../../../src/domain/entities/GeoReverseGeocodeError';

describe('GeoReverseGeocodeError', () => {
  it('should create an error with code 1 (invalid coordinates)', () => {
    const code: GeoReverseGeocodeError['code'] = 1;
    const message = 'Invalid coordinates';
    const err = createGeoReverseGeocodeError(code, message);

    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe(message);
    expect((err as GeoReverseGeocodeError).code).toBe(1);
  });

  it('should create an error with code 2 (network failure)', () => {
    const code: GeoReverseGeocodeError['code'] = 2;
    const message = 'Network error';
    const err = createGeoReverseGeocodeError(code, message);

    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe(message);
    expect((err as GeoReverseGeocodeError).code).toBe(2);
  });

  it('should create an error with code 3 (provider error)', () => {
    const code: GeoReverseGeocodeError['code'] = 3;
    const message = 'Provider error';
    const err = createGeoReverseGeocodeError(code, message);

    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe(message);
    expect((err as GeoReverseGeocodeError).code).toBe(3);
  });

  it('should allow different messages for the same code', () => {
    const code: GeoReverseGeocodeError['code'] = 2;
    const err1 = createGeoReverseGeocodeError(code, 'Timeout');
    const err2 = createGeoReverseGeocodeError(code, 'Connection refused');

    expect(err1.message).not.toBe(err2.message);
    expect((err1 as GeoReverseGeocodeError).code).toBe(2);
    expect((err2 as GeoReverseGeocodeError).code).toBe(2);
  });

  it('should have code as an own property', () => {
    const err = createGeoReverseGeocodeError(1, 'Test');
    expect(Object.prototype.hasOwnProperty.call(err, 'code')).toBe(true);
  });

  it('should expose code as a writable own property (Object.assign semantics)', () => {
    const err = createGeoReverseGeocodeError(1, 'Test');
    expect(Object.getOwnPropertyDescriptor(err, 'code')?.writable).toBe(true);
  });

  it('should preserve stack trace', () => {
    const err = createGeoReverseGeocodeError(3, 'Stack test');
    expect(typeof err.stack).toBe('string');
  });

  it('should produce independent error instances for repeated calls', () => {
    const err1 = createGeoReverseGeocodeError(1, 'First');
    const err2 = createGeoReverseGeocodeError(2, 'Second');
    expect(err1).not.toBe(err2);
    expect((err1 as GeoReverseGeocodeError).code).toBe(1);
    expect((err2 as GeoReverseGeocodeError).code).toBe(2);
  });
});
