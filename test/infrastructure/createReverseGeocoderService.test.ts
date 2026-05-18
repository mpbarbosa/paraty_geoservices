import { createReverseGeocoderService } from '../../src/infrastructure/createReverseGeocoderService';
import type { CreateReverseGeocoderServiceConfig, LegacyFetchManager } from '../../src/infrastructure/createReverseGeocoderService';
import { ReverseGeocoder as ReverseGeocoderService } from '../../src/application/services/ReverseGeocoder';
import { AwsGeocoder } from '../../src/infrastructure/providers/AwsGeocoder';
import { NominatimGeocoder } from '../../src/infrastructure/providers/NominatimGeocoder';

jest.mock('../../src/infrastructure/providers/AwsGeocoder');
jest.mock('../../src/infrastructure/providers/NominatimGeocoder');
jest.mock('../../src/application/services/ReverseGeocoder');

const MockAwsGeocoder = AwsGeocoder as jest.MockedClass<typeof AwsGeocoder>;
const MockNominatimGeocoder = NominatimGeocoder as jest.MockedClass<typeof NominatimGeocoder>;
const MockReverseGeocoderService = ReverseGeocoderService as jest.MockedClass<typeof ReverseGeocoderService>;

describe('createReverseGeocoderService', () => {
  beforeEach(() => {
    MockAwsGeocoder.mockClear();
    MockNominatimGeocoder.mockClear();
    MockReverseGeocoderService.mockClear();
  });

  it('should create a ReverseGeocoderService with only NominatimGeocoder by default', () => {
    const config: CreateReverseGeocoderServiceConfig = {
      nominatimApiUrl: 'https://nominatim.example.com',
      openstreetmapBaseUrl: 'https://osm.example.com',
      corsProxy: undefined,
      enableCorsFallback: false,
    };
    createReverseGeocoderService(null, config);

    expect(MockNominatimGeocoder).toHaveBeenCalledWith({
      nominatimApiUrl: config.nominatimApiUrl,
      openstreetmapBaseUrl: config.openstreetmapBaseUrl,
      corsProxy: config.corsProxy,
      enableCorsFallback: config.enableCorsFallback,
      legacyFetchManager: null,
    });
    expect(MockAwsGeocoder).not.toHaveBeenCalled();
    expect(MockReverseGeocoderService).toHaveBeenCalledWith(
      expect.objectContaining({
        nominatimGeocoder: expect.any(MockNominatimGeocoder),
        awsGeocoder: null,
      })
    );
  });

  it('should create a ReverseGeocoderService with AwsGeocoder when awsLbsEnabled and awsLbsBaseUrl are set', () => {
    const config: CreateReverseGeocoderServiceConfig = {
      nominatimApiUrl: 'https://nominatim.example.com',
      openstreetmapBaseUrl: 'https://osm.example.com',
      awsLbsEnabled: true,
      awsLbsBaseUrl: 'https://aws.example.com',
    };
    createReverseGeocoderService(null, config);

    expect(MockAwsGeocoder).toHaveBeenCalledWith('https://aws.example.com');
    expect(MockReverseGeocoderService).toHaveBeenCalledWith(
      expect.objectContaining({
        awsGeocoder: expect.any(MockAwsGeocoder),
      })
    );
  });

  it('should not create AwsGeocoder if awsLbsEnabled is false', () => {
    const config: CreateReverseGeocoderServiceConfig = {
      nominatimApiUrl: 'https://nominatim.example.com',
      openstreetmapBaseUrl: 'https://osm.example.com',
      awsLbsEnabled: false,
      awsLbsBaseUrl: 'https://aws.example.com',
    };
    createReverseGeocoderService(null, config);

    expect(MockAwsGeocoder).not.toHaveBeenCalled();
    expect(MockReverseGeocoderService).toHaveBeenCalledWith(
      expect.objectContaining({
        awsGeocoder: null,
      })
    );
  });

  it('should not create AwsGeocoder if awsLbsBaseUrl is empty', () => {
    const config: CreateReverseGeocoderServiceConfig = {
      nominatimApiUrl: 'https://nominatim.example.com',
      openstreetmapBaseUrl: 'https://osm.example.com',
      awsLbsEnabled: true,
      awsLbsBaseUrl: '',
    };
    createReverseGeocoderService(null, config);

    expect(MockAwsGeocoder).not.toHaveBeenCalled();
    expect(MockReverseGeocoderService).toHaveBeenCalledWith(
      expect.objectContaining({ awsGeocoder: null })
    );
  });

  it('should use provided awsGeocoder instance if present in config', () => {
    const fakeAwsGeocoder = {} as AwsGeocoder;
    const config: CreateReverseGeocoderServiceConfig = {
      nominatimApiUrl: 'https://nominatim.example.com',
      openstreetmapBaseUrl: 'https://osm.example.com',
      awsGeocoder: fakeAwsGeocoder,
      awsLbsEnabled: true,
      awsLbsBaseUrl: 'https://aws.example.com',
    };
    createReverseGeocoderService(null, config);

    expect(MockAwsGeocoder).not.toHaveBeenCalled();
    expect(MockReverseGeocoderService).toHaveBeenCalledWith(
      expect.objectContaining({
        awsGeocoder: fakeAwsGeocoder,
      })
    );
  });

  it('should pass legacyFetchManager to NominatimGeocoder', () => {
    const fetchManager: LegacyFetchManager = {
      fetch: jest.fn(),
      subscribe: jest.fn(),
    };
    const config: CreateReverseGeocoderServiceConfig = {
      nominatimApiUrl: 'https://nominatim.example.com',
      openstreetmapBaseUrl: 'https://osm.example.com',
    };
    createReverseGeocoderService(fetchManager, config);

    expect(MockNominatimGeocoder).toHaveBeenCalledWith(
      expect.objectContaining({
        legacyFetchManager: fetchManager,
      })
    );
  });

  it('should pass all additional config options to ReverseGeocoderService', () => {
    const config: CreateReverseGeocoderServiceConfig = {
      nominatimApiUrl: 'https://nominatim.example.com',
      openstreetmapBaseUrl: 'https://osm.example.com',
      geocodingPrimaryProvider: 'nominatim',
      positionUpdateEvent: 'PositionManager updated',
      immediateAddressUpdateEvent: 'Immediate address update',
      logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn() },
      errorNotifier: { displayError: jest.fn() },
      emitBrowserProviderEvents: true,
    };
    createReverseGeocoderService(null, config);

    expect(MockReverseGeocoderService).toHaveBeenCalledWith(
      expect.objectContaining({
        geocodingPrimaryProvider: 'nominatim',
        positionUpdateEvent: 'PositionManager updated',
        immediateAddressUpdateEvent: 'Immediate address update',
        logger: config.logger,
        errorNotifier: config.errorNotifier,
        emitBrowserProviderEvents: true,
      })
    );
  });

  it('should handle missing config gracefully', () => {
    expect(() => createReverseGeocoderService()).not.toThrow();
    expect(MockNominatimGeocoder).toHaveBeenCalled();
    expect(MockReverseGeocoderService).toHaveBeenCalled();
  });
});
