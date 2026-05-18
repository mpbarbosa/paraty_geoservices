import {
  ADDRESS_FETCHED_EVENT,
  GEOCODING_ERROR_EVENT,
  POSITION_UPDATE_EVENT,
  IMMEDIATE_ADDRESS_UPDATE_EVENT,
} from '../../../src/application/services/reverseGeocoderEvents';

describe('reverseGeocoderEvents constants', () => {
  it('should export ADDRESS_FETCHED_EVENT with correct value', () => {
    expect(ADDRESS_FETCHED_EVENT).toBe('Address fetched');
  });

  it('should export GEOCODING_ERROR_EVENT with correct value', () => {
    expect(GEOCODING_ERROR_EVENT).toBe('Geocoding error');
  });

  it('should export POSITION_UPDATE_EVENT with correct value', () => {
    expect(POSITION_UPDATE_EVENT).toBe('PositionManager updated');
  });

  it('should export IMMEDIATE_ADDRESS_UPDATE_EVENT with correct value', () => {
    expect(IMMEDIATE_ADDRESS_UPDATE_EVENT).toBe('Immediate address update');
  });

  it('should have unique event constant values', () => {
    const values = [
      ADDRESS_FETCHED_EVENT,
      GEOCODING_ERROR_EVENT,
      POSITION_UPDATE_EVENT,
      IMMEDIATE_ADDRESS_UPDATE_EVENT,
    ];
    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);
  });

  it('should export all constants as non-empty strings', () => {
    const constants = [
      ADDRESS_FETCHED_EVENT,
      GEOCODING_ERROR_EVENT,
      POSITION_UPDATE_EVENT,
      IMMEDIATE_ADDRESS_UPDATE_EVENT,
    ];
    for (const c of constants) {
      expect(typeof c).toBe('string');
      expect(c.length).toBeGreaterThan(0);
    }
  });
});
