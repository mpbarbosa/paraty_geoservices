/**
 * Integration tests for BrowserGeolocationProvider.
 *
 * Verifies that the provider correctly delegates to an injected navigator,
 * falls back to the global navigator, and handles unsupported environments.
 *
 * @module test/infrastructure/providers/BrowserGeolocationProvider.test
 */

import { BrowserGeolocationProvider } from '../../../src/infrastructure/providers/BrowserGeolocationProvider';
import { BrowserGeolocationProvider as PublicBrowserGeolocationProvider } from '../../../src';

describe('BrowserGeolocationProvider', () => {
  let originalNavigatorDescriptor: PropertyDescriptor | undefined;

  const createNavigatorMock = (overrides: Record<string, unknown> = {}): Navigator => ({
    geolocation: {
      getCurrentPosition: jest.fn(),
      watchPosition: jest.fn(),
      clearWatch: jest.fn(),
    },
    ...overrides,
  } as unknown as Navigator);

  const setGlobalNavigator = (value: Navigator | undefined): void => {
    Object.defineProperty(globalThis, 'navigator', {
      value,
      configurable: true,
      writable: true,
    });
  };

  beforeEach(() => {
    originalNavigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  });

  afterEach(() => {
    if (originalNavigatorDescriptor) {
      Object.defineProperty(globalThis, 'navigator', originalNavigatorDescriptor);
    } else {
      delete (globalThis as { navigator?: Navigator }).navigator;
    }
    jest.clearAllMocks();
  });

  describe('constructor and capability helpers', () => {
    it('should accept an injected navigator object', () => {
      const navigatorMock = createNavigatorMock();
      const provider = new BrowserGeolocationProvider(navigatorMock);

      expect(provider.getNavigator()).toBe(navigatorMock);
    });

    it('should resolve the global navigator when constructed without arguments', () => {
      const navigatorMock = createNavigatorMock();
      setGlobalNavigator(navigatorMock);

      const provider = new BrowserGeolocationProvider();

      expect(provider.getNavigator()).toBe(navigatorMock);
    });

    it('should treat an explicit undefined navigator as no navigator', () => {
      setGlobalNavigator(createNavigatorMock());

      const provider = new BrowserGeolocationProvider(undefined);

      expect(provider.getNavigator()).toBeNull();
    });

    it('should return true from isSupported when geolocation exists', () => {
      const provider = new BrowserGeolocationProvider(createNavigatorMock());

      expect(provider.isSupported()).toBe(true);
    });

    it('should return false from isSupported when geolocation is missing', () => {
      const provider = new BrowserGeolocationProvider({} as Navigator);

      expect(provider.isSupported()).toBe(false);
    });

    it('should detect Permissions API support', () => {
      const provider = new BrowserGeolocationProvider(
        createNavigatorMock({
          permissions: { query: jest.fn() },
        }),
      );

      expect(provider.isPermissionsAPISupported()).toBe(true);
    });

    it('should report missing Permissions API support', () => {
      const provider = new BrowserGeolocationProvider(createNavigatorMock());

      expect(provider.isPermissionsAPISupported()).toBe(false);
    });
  });

  describe('getCurrentPosition', () => {
    it('should delegate to the injected navigator geolocation API', () => {
      const navigatorMock = createNavigatorMock();
      const provider = new BrowserGeolocationProvider(navigatorMock);
      const success = jest.fn();
      const error = jest.fn();
      const options = { enableHighAccuracy: true };

      provider.getCurrentPosition(success, error, options);

      expect(navigatorMock.geolocation.getCurrentPosition).toHaveBeenCalledWith(
        success,
        error,
        options,
      );
    });

    it('should use the global navigator when none is injected', () => {
      const navigatorMock = createNavigatorMock();
      setGlobalNavigator(navigatorMock);
      const provider = new BrowserGeolocationProvider();

      provider.getCurrentPosition(jest.fn(), jest.fn());

      expect(navigatorMock.geolocation.getCurrentPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        undefined,
      );
    });

    it('should call the error callback with a target-compatible unsupported error', () => {
      const provider = new BrowserGeolocationProvider(null);
      const error = jest.fn();

      provider.getCurrentPosition(jest.fn(), error);

      expect(error).toHaveBeenCalledWith({
        code: 2,
        message: 'Geolocation is not supported',
      });
    });
  });

  describe('watchPosition', () => {
    it('should delegate to navigator.geolocation.watchPosition and return the watch id', () => {
      const navigatorMock = createNavigatorMock();
      const provider = new BrowserGeolocationProvider(navigatorMock);
      const success = jest.fn();
      const error = jest.fn();
      const options = { timeout: 1000 };

      (navigatorMock.geolocation.watchPosition as jest.Mock).mockReturnValue(42);

      const watchId = provider.watchPosition(success, error, options);

      expect(navigatorMock.geolocation.watchPosition).toHaveBeenCalledWith(
        success,
        error,
        options,
      );
      expect(watchId).toBe(42);
    });

    it('should return null when geolocation is not supported', () => {
      const provider = new BrowserGeolocationProvider(null);

      expect(provider.watchPosition(jest.fn(), jest.fn())).toBeNull();
    });
  });

  describe('clearWatch', () => {
    it('should delegate to navigator.geolocation.clearWatch', () => {
      const navigatorMock = createNavigatorMock();
      const provider = new BrowserGeolocationProvider(navigatorMock);

      provider.clearWatch(99);

      expect(navigatorMock.geolocation.clearWatch).toHaveBeenCalledWith(99);
    });

    it('should not throw when geolocation is unavailable', () => {
      const provider = new BrowserGeolocationProvider(null);

      expect(() => provider.clearWatch(99)).not.toThrow();
    });
  });

  describe('public entry point', () => {
    it('should export BrowserGeolocationProvider from the package entry point', () => {
      expect(PublicBrowserGeolocationProvider).toBe(BrowserGeolocationProvider);
    });
  });
});
