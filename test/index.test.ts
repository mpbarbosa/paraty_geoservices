import {
  ChangeDetectionCoordinator,
  type AddressFieldChangeEvent,
  type IAddressState,
  type IObserverSubject,
  type ILogger,
} from '../src';

describe('package root exports', () => {
  it('exports ChangeDetectionCoordinator from the package entry point', () => {
    const addressState: IAddressState = { currentAddress: null };
    const observerSubject: IObserverSubject = { observers: [], functionObservers: [] };
    const logger: ILogger = {
      warn: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
    };

    const coordinator = new ChangeDetectionCoordinator({
      addressState,
      observerSubject,
      logger,
    });

    expect(coordinator).toBeInstanceOf(ChangeDetectionCoordinator);
  });

  it('exports ChangeDetectionCoordinator types from the package entry point', () => {
    const event: AddressFieldChangeEvent = {
      from: null,
      to: 'Centro',
      previousAddress: null,
      currentAddress: null,
    };

    expect(event.to).toBe('Centro');
  });
});
