import type { GeoPositionError } from '../../../src/domain/entities/GeoPositionError';

describe('GeoPositionError interface', () => {
  it('should allow code 1 (PERMISSION_DENIED) with a message', () => {
    const error: GeoPositionError = { code: 1, message: 'Permission denied' };
    expect(error.code).toBe(1);
    expect(error.message).toBe('Permission denied');
  });

  it('should allow code 2 (POSITION_UNAVAILABLE) with a message', () => {
    const error: GeoPositionError = { code: 2, message: 'Position unavailable' };
    expect(error.code).toBe(2);
    expect(error.message).toBe('Position unavailable');
  });

  it('should allow code 3 (TIMEOUT) with a message', () => {
    const error: GeoPositionError = { code: 3, message: 'Timeout' };
    expect(error.code).toBe(3);
    expect(error.message).toBe('Timeout');
  });

  it('should require a message property', () => {
    // @ts-expect-error message is required
    const error: GeoPositionError = { code: 1 };
    expect(error).not.toBeUndefined();
  });

  it('should require a code property', () => {
    // @ts-expect-error code is required
    const error: GeoPositionError = { message: 'Missing code' };
    expect(error).not.toBeUndefined();
  });

  it('should not allow invalid code values', () => {
    // @ts-expect-error code must be 1, 2, or 3
    const error: GeoPositionError = { code: 4, message: 'Invalid code' };
    expect(error).not.toBeUndefined();
  });

  it('should be readonly (code and message)', () => {
    const error: GeoPositionError = { code: 1, message: 'Test' };
    // @ts-expect-error code is readonly
    error.code = 2;
    // @ts-expect-error message is readonly
    error.message = 'Changed';
    expect(error.code).toBe(1);
    expect(error.message).toBe('Test');
  });
});
