import { BrowserGeolocationProvider } from '../../../src/infrastructure/providers/BrowserGeolocationProvider';

describe('BrowserGeolocationProvider', () => {
  let provider: BrowserGeolocationProvider;
  let originalNavigator: any;

  beforeEach(() => {
    provider = new BrowserGeolocationProvider();
    originalNavigator = global.navigator;
    // @ts-ignore
    global.navigator = {
      geolocation: {
        getCurrentPosition: jest.fn(),
        watchPosition: jest.fn(),
        clearWatch: jest.fn(),
      },
    };
  });

  afterEach(() => {
    global.navigator = originalNavigator;
    jest.clearAllMocks();
  });

  describe('getCurrentPosition', () => {
    it('should delegate to navigator.geolocation.getCurrentPosition with correct arguments', () => {
      const success = jest.fn();
      const error = jest.fn();
      const options = { enableHighAccuracy: true };
      provider.getCurrentPosition(success, error, options);
      expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalledWith(
        success,
        error,
        options
      );
    });

    it('should work without options', () => {
      const success = jest.fn();
      const error = jest.fn();
      provider.getCurrentPosition(success, error);
      expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalledWith(
        success,
        error,
        undefined
      );
    });
  });

  describe('watchPosition', () => {
    it('should delegate to navigator.geolocation.watchPosition and return the watch id', () => {
      const success = jest.fn();
      const error = jest.fn();
      const options = { timeout: 1000 };
      (navigator.geolocation.watchPosition as jest.Mock).mockReturnValue(42);
      const watchId = provider.watchPosition(success, error, options);
      expect(navigator.geolocation.watchPosition).toHaveBeenCalledWith(
        success,
        error,
        options
      );
      expect(watchId).toBe(42);
    });

    it('should work without options', () => {
      const success = jest.fn();
      const error = jest.fn();
      (navigator.geolocation.watchPosition as jest.Mock).mockReturnValue(7);
      const watchId = provider.watchPosition(success, error);
      expect(navigator.geolocation.watchPosition).toHaveBeenCalledWith(
        success,
        error,
        undefined
      );
      expect(watchId).toBe(7);
    });
  });

  describe('clearWatch', () => {
    it('should delegate to navigator.geolocation.clearWatch', () => {
      provider.clearWatch(99);
      expect(navigator.geolocation.clearWatch).toHaveBeenCalledWith(99);
    });
  });

  describe('isSupported', () => {
    it('should return true if navigator.geolocation exists', () => {
      expect(provider.isSupported()).toBe(true);
    });

    it('should return false if navigator is undefined', () => {
      // @ts-ignore
      global.navigator = undefined;
      expect(provider.isSupported()).toBe(false);
    });

    it('should return false if navigator.geolocation is missing', () => {
      // @ts-ignore
      global.navigator = {};
      expect(provider.isSupported()).toBe(false);
    });
  });
});
