import {
  AwsGeocoder,
  type AwsReverseGeocodeResponse,
} from '../../../src/infrastructure/providers/AwsGeocoder';
import { AwsGeocoder as PublicAwsGeocoder } from '../../../src';

describe('AwsGeocoder', () => {
  const baseUrl = 'https://test.example.com/';
  const sampleAwsResponse: AwsReverseGeocodeResponse = {
    provider: 'aws-location-service',
    coordinates: { latitude: -23.55052, longitude: -46.633309 },
    address: {
      label: 'Movelstore, Sé, São Paulo, 01016-000, BRA',
      neighborhood: 'Sé',
      municipality: 'São Paulo',
      region: 'São Paulo',
      country: 'BRA',
      postalCode: '01016-000',
      interpolated: false,
    },
    geometry: { Point: [-46.633225, -23.5505466] },
  };

  const mockFetch = (
    responseBody: AwsReverseGeocodeResponse,
    status = 200,
  ): void => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      json: jest.fn().mockResolvedValue(responseBody),
    }) as unknown as typeof fetch;
  };

  let originalAwsLbsBaseUrl: string | undefined;

  beforeEach(() => {
    originalAwsLbsBaseUrl = process.env.AWS_LBS_BASE_URL;
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (typeof originalAwsLbsBaseUrl === 'undefined') {
      delete process.env.AWS_LBS_BASE_URL;
    } else {
      process.env.AWS_LBS_BASE_URL = originalAwsLbsBaseUrl;
    }
  });

  describe('constructor', () => {
    it('should use the provided baseUrl and normalize trailing slashes', () => {
      const geocoder = new AwsGeocoder(baseUrl);

      expect(geocoder.baseUrl).toBe('https://test.example.com');
      expect(geocoder.endpoint).toBe(
        'https://test.example.com/api/geocode/reverse',
      );
    });

    it('should fall back to AWS_LBS_BASE_URL when baseUrl is omitted', () => {
      process.env.AWS_LBS_BASE_URL = 'https://env.example.com';

      const geocoder = new AwsGeocoder();

      expect(geocoder.endpoint).toBe(
        'https://env.example.com/api/geocode/reverse',
      );
    });

    it('should throw when no baseUrl is available', () => {
      delete process.env.AWS_LBS_BASE_URL;

      expect(() => new AwsGeocoder()).toThrow(
        'AwsGeocoder requires a baseUrl or AWS_LBS_BASE_URL environment variable',
      );
    });
  });

  describe('reverseGeocode', () => {
    it('should send POST with the correct body and headers', async () => {
      mockFetch(sampleAwsResponse);
      const geocoder = new AwsGeocoder(baseUrl);

      await geocoder.reverseGeocode(-23.55052, -46.633309);

      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://test.example.com/api/geocode/reverse',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            latitude: -23.55052,
            longitude: -46.633309,
          }),
        }),
      );
    });

    it('should return a GeoAddress', async () => {
      mockFetch(sampleAwsResponse);
      const geocoder = new AwsGeocoder(baseUrl);

      const result = await geocoder.reverseGeocode(-23.55052, -46.633309);

      expect(result).toEqual({
        street: 'Movelstore',
        streetNumber: null,
        complement: null,
        neighborhood: 'Sé',
        city: 'São Paulo',
        metropolitanRegion: null,
        state: 'São Paulo',
        stateCode: 'SP',
        postalCode: '01016-000',
        country: 'Brasil',
      });
    });

    it('should allow zero coordinates', async () => {
      mockFetch({
        address: {
          label: 'Marco Zero, Recife, 50030-230, BRA',
          municipality: 'Recife',
          region: 'Pernambuco',
          country: 'BRA',
          postalCode: '50030-230',
        },
      });
      const geocoder = new AwsGeocoder(baseUrl);

      await expect(geocoder.reverseGeocode(0, 0)).resolves.toEqual(
        expect.objectContaining({
          city: 'Recife',
          stateCode: 'PE',
        }),
      );
    });

    it('should handle a missing address object', async () => {
      mockFetch({ provider: 'aws-location-service' });
      const geocoder = new AwsGeocoder(baseUrl);

      const result = await geocoder.reverseGeocode(-23.55052, -46.633309);

      expect(result).toEqual({
        street: null,
        streetNumber: null,
        complement: null,
        neighborhood: null,
        city: null,
        metropolitanRegion: null,
        state: null,
        stateCode: null,
        postalCode: null,
        country: 'Brasil',
      });
    });

    it('should throw on a non-OK HTTP response', async () => {
      mockFetch({}, 500);
      const geocoder = new AwsGeocoder(baseUrl);

      await expect(
        geocoder.reverseGeocode(-23.55052, -46.633309),
      ).rejects.toMatchObject({
        code: 3,
        message: expect.stringContaining('HTTP 500'),
      });
    });

    it('should throw on network failure', async () => {
      globalThis.fetch = jest
        .fn()
        .mockRejectedValue(new Error('Network error')) as unknown as typeof fetch;
      const geocoder = new AwsGeocoder(baseUrl);

      await expect(
        geocoder.reverseGeocode(-23.55052, -46.633309),
      ).rejects.toMatchObject({
        code: 2,
        message: expect.stringContaining('Network error'),
      });
    });

    it('should throw on invalid coordinates', async () => {
      const geocoder = new AwsGeocoder(baseUrl);

      await expect(
        geocoder.reverseGeocode(Number.NaN, -46.633309),
      ).rejects.toMatchObject({
        code: 1,
        message: expect.stringContaining('Invalid coordinates'),
      });
    });
  });

  describe('public entry point', () => {
    it('should export AwsGeocoder from the package entry point', () => {
      expect(PublicAwsGeocoder).toBe(AwsGeocoder);
    });
  });
});
