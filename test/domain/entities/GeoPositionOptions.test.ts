import type { GeoPositionOptions } from '../../../src/domain/entities/GeoPositionOptions';

describe('GeoPositionOptions interface', () => {
  it('should allow all properties to be omitted', () => {
    const options: GeoPositionOptions = {};
    expect(options).toEqual({});
  });

  it('should allow enableHighAccuracy to be true', () => {
    const options: GeoPositionOptions = { enableHighAccuracy: true };
    expect(options.enableHighAccuracy).toBe(true);
  });

  it('should allow enableHighAccuracy to be false', () => {
    const options: GeoPositionOptions = { enableHighAccuracy: false };
    expect(options.enableHighAccuracy).toBe(false);
  });

  it('should allow timeout to be set', () => {
    const options: GeoPositionOptions = { timeout: 5000 };
    expect(options.timeout).toBe(5000);
  });

  it('should allow maximumAge to be set', () => {
    const options: GeoPositionOptions = { maximumAge: 10000 };
    expect(options.maximumAge).toBe(10000);
  });

  it('should allow all properties to be set together', () => {
    const options: GeoPositionOptions = {
      enableHighAccuracy: true,
      timeout: 2000,
      maximumAge: 3000,
    };
    expect(options).toEqual({
      enableHighAccuracy: true,
      timeout: 2000,
      maximumAge: 3000,
    });
  });

  it('should allow timeout and maximumAge to be zero', () => {
    const options: GeoPositionOptions = { timeout: 0, maximumAge: 0 };
    expect(options.timeout).toBe(0);
    expect(options.maximumAge).toBe(0);
  });

  it('should allow timeout to be Infinity', () => {
    const options: GeoPositionOptions = { timeout: Infinity };
    expect(options.timeout).toBe(Infinity);
  });

  it('should not allow extra properties', () => {
    // @ts-expect-error extraProperty is not allowed
    const options: GeoPositionOptions = { extraProperty: 123 };
    expect(options).not.toBeUndefined();
  });

  it('should not allow non-boolean enableHighAccuracy', () => {
    // @ts-expect-error enableHighAccuracy must be boolean
    const options: GeoPositionOptions = { enableHighAccuracy: 'yes' };
    expect(options).not.toBeUndefined();
  });

  it('should not allow non-number timeout', () => {
    // @ts-expect-error timeout must be a number
    const options: GeoPositionOptions = { timeout: 'fast' };
    expect(options).not.toBeUndefined();
  });

  it('should not allow non-number maximumAge', () => {
    // @ts-expect-error maximumAge must be a number
    const options: GeoPositionOptions = { maximumAge: 'old' };
    expect(options).not.toBeUndefined();
  });
});
