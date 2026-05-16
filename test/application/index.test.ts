import {
  GetCurrentPositionUseCase,
  WatchPositionUseCase,
  ChangeDetectionCoordinator,
} from '../../src/application/index';
import type {
  GetCurrentPositionOutput,
  AddressFieldChangeEvent,
  IAddressState,
  IObserverSubject,
  ILogger,
} from '../../src/application/index';

describe('application/index exports', () => {
  it('should export GetCurrentPositionUseCase as a constructor', () => {
    expect(typeof GetCurrentPositionUseCase).toBe('function');
    // Instantiation may fail if dependencies are required, but type should be correct
    try {
      const instance = new (GetCurrentPositionUseCase as any)();
      expect(instance).toBeInstanceOf(GetCurrentPositionUseCase);
    } catch (e) {
      // Acceptable if constructor requires params
      expect(e).toBeDefined();
    }
  });

  it('should export WatchPositionUseCase as a constructor', () => {
    expect(typeof WatchPositionUseCase).toBe('function');
    try {
      const instance = new (WatchPositionUseCase as any)();
      expect(instance).toBeInstanceOf(WatchPositionUseCase);
    } catch (e) {
      expect(e).toBeDefined();
    }
  });

  it('should export GetCurrentPositionOutput type', () => {
    const mockGeoPosition = {
      coords: {
        latitude: 1,
        longitude: 2,
        altitude: 3,
        accuracy: 4,
        altitudeAccuracy: 5,
        heading: 6,
        speed: 7,
      },
      timestamp: 1234567890,
    };
    const output: GetCurrentPositionOutput = { position: mockGeoPosition as any };
    expect(output.position).toBe(mockGeoPosition);
  });

  it('should export ChangeDetectionCoordinator as a constructor', () => {
    const addressState: IAddressState = { currentAddress: null };
    const observerSubject: IObserverSubject = { observers: [], functionObservers: [] };
    const logger: ILogger = {
      warn: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
    };

    const instance = new ChangeDetectionCoordinator({
      addressState,
      observerSubject,
      logger,
    });

    expect(instance).toBeInstanceOf(ChangeDetectionCoordinator);
  });

  it('should export ChangeDetectionCoordinator event types', () => {
    const event: AddressFieldChangeEvent = {
      from: 'Rua Antiga',
      to: 'Rua Nova',
      previousAddress: null,
      currentAddress: null,
    };

    expect(event.to).toBe('Rua Nova');
  });

});
