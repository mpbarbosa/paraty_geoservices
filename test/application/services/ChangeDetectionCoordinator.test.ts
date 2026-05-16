import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import {
	ChangeDetectionCoordinator,
	type AddressFieldChangeEvent,
	type AddressChangeType,
	type IAddressChangeObserver,
	type IObserverSubject,
	type IAddressComponentExtractor,
	type IAddressState,
	type ILogger,
} from '../../../src/application/services/ChangeDetectionCoordinator';
import type { GeoAddress } from '../../../src/domain/entities/GeoAddress';
import type { GeoPosition } from '../../../src/domain/entities/GeoPosition';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const ADDRESS_A: GeoAddress = {
	street: 'Avenida Paulista', streetNumber: '1578', complement: null,
	neighborhood: 'Bela Vista', city: 'São Paulo', metropolitanRegion: 'RMSP',
	state: 'São Paulo', stateCode: 'SP', postalCode: '01310-200', country: 'Brasil',
};

const ADDRESS_B: GeoAddress = {
	street: 'Rua Oscar Freire', streetNumber: null, complement: null,
	neighborhood: 'Jardins', city: 'São Paulo', metropolitanRegion: 'RMSP',
	state: 'São Paulo', stateCode: 'SP', postalCode: null, country: 'Brasil',
};

const MOCK_POSITION: GeoPosition = {
	coords: {
		latitude: -23.5505, longitude: -46.6333,
		accuracy: 10, altitude: null, altitudeAccuracy: null, heading: null, speed: null,
	},
	timestamp: 1_700_000_000_000,
};

function makeEvent(
	from: string | null,
	to: string | null,
	previousAddress: GeoAddress | null = ADDRESS_A,
	currentAddress: GeoAddress | null = ADDRESS_B,
): AddressFieldChangeEvent {
	return { from, to, previousAddress, currentAddress };
}

// ── Stubs ─────────────────────────────────────────────────────────────────────

class MockObserverSubject implements IObserverSubject {
	observers: IAddressChangeObserver[] | null = [];
	functionObservers: Array<(p: GeoPosition | null, a: GeoAddress | null, e: AddressFieldChangeEvent) => void> = [];
	subscribe(o: IAddressChangeObserver) { this.observers!.push(o); }
	subscribeFunction(fn: (p: GeoPosition | null, a: GeoAddress | null, e: AddressFieldChangeEvent) => void) {
		this.functionObservers.push(fn);
	}
}

function makeLogger(): jest.Mocked<ILogger> {
	return {
		warn:  jest.fn() as jest.MockedFunction<ILogger['warn']>,
		error: jest.fn() as jest.MockedFunction<ILogger['error']>,
		info:  jest.fn() as jest.MockedFunction<ILogger['info']>,
	};
}

// Module-level extractor callbacks — reset in afterEach.
let _streetCb:       ((event: AddressFieldChangeEvent) => void) | null = null;
let _neighborhoodCb: ((event: AddressFieldChangeEvent) => void) | null = null;
let _cityCb:         ((event: AddressFieldChangeEvent) => void) | null = null;

const mockExtractor: IAddressComponentExtractor & {
	getStreetCallback():       typeof _streetCb;
	getNeighborhoodCallback(): typeof _neighborhoodCb;
	getCityCallback():         typeof _cityCb;
} = {
	setStreetChangeCallback:       (cb) => { _streetCb = cb; },
	setNeighborhoodChangeCallback: (cb) => { _neighborhoodCb = cb; },
	setCityChangeCallback:         (cb) => { _cityCb = cb; },
	getStreetCallback:       () => _streetCb,
	getNeighborhoodCallback: () => _neighborhoodCb,
	getCityCallback:         () => _cityCb,
};

// ── Test suite ────────────────────────────────────────────────────────────────

describe('ChangeDetectionCoordinator', () => {
	let coordinator: ChangeDetectionCoordinator;
	let mockAddressState: IAddressState;
	let mockObserverSubject: MockObserverSubject;
	let mockLogger: jest.Mocked<ILogger>;

	beforeEach(() => {
		mockAddressState    = { currentAddress: ADDRESS_A };
		mockObserverSubject = new MockObserverSubject();
		mockLogger          = makeLogger();

		coordinator = new ChangeDetectionCoordinator({
			addressState:    mockAddressState,
			observerSubject: mockObserverSubject,
			logger:          mockLogger,
		});
		coordinator.setAddressComponentExtractor(mockExtractor);
	});

	afterEach(() => {
		_streetCb       = null;
		_neighborhoodCb = null;
		_cityCb         = null;
	});

	// ── Construction ──────────────────────────────────────────────────────────

	describe('Constructor and Initialization', () => {
		test('stores injected collaborators and initializes position to null', () => {
			expect(coordinator.addressState).toBe(mockAddressState);
			expect(coordinator.observerSubject).toBe(mockObserverSubject);
			expect(coordinator.currentPosition).toBeNull();
		});

		test('accepts any IObserverSubject implementation', () => {
			const other = new MockObserverSubject();
			const c = new ChangeDetectionCoordinator({
				addressState: mockAddressState, observerSubject: other, logger: mockLogger,
			});
			expect(c.observerSubject).toBe(other);
		});
	});

	// ── Position management ───────────────────────────────────────────────────

	describe('Position Management', () => {
		test('stores a GeoPosition', () => {
			coordinator.setCurrentPosition(MOCK_POSITION);
			expect(coordinator.currentPosition).toBe(MOCK_POSITION);
		});

		test('accepts null to clear the position', () => {
			coordinator.setCurrentPosition(MOCK_POSITION);
			coordinator.setCurrentPosition(null);
			expect(coordinator.currentPosition).toBeNull();
		});
	});

	// ── Callback setup ────────────────────────────────────────────────────────

	describe('Change Detection Setup', () => {
		test('setupChangeDetection registers all three callbacks', () => {
			coordinator.setupChangeDetection();
			expect(mockExtractor.getStreetCallback()).toBeDefined();
			expect(mockExtractor.getNeighborhoodCallback()).toBeDefined();
			expect(mockExtractor.getCityCallback()).toBeDefined();
		});

		test('setupStreetChangeDetection registers only the street callback', () => {
			coordinator.setupStreetChangeDetection();
			expect(mockExtractor.getStreetCallback()).toBeDefined();
			expect(mockExtractor.getNeighborhoodCallback()).toBeNull();
		});

		test('setupNeighborhoodChangeDetection registers only the neighborhood callback', () => {
			coordinator.setupNeighborhoodChangeDetection();
			expect(mockExtractor.getNeighborhoodCallback()).toBeDefined();
			expect(mockExtractor.getCityCallback()).toBeNull();
		});

		test('setupCityChangeDetection registers only the city callback', () => {
			coordinator.setupCityChangeDetection();
			expect(mockExtractor.getCityCallback()).toBeDefined();
			expect(mockExtractor.getStreetCallback()).toBeNull();
		});

		test('warns via injected logger when extractor is not set', () => {
			const standalone = new ChangeDetectionCoordinator({
				addressState: mockAddressState, observerSubject: mockObserverSubject, logger: mockLogger,
			});
			standalone.setupChangeDetection();
			expect(mockLogger.warn).toHaveBeenCalledWith(
				expect.stringContaining('ChangeDetectionCoordinator'),
			);
		});
	});

	// ── Callback removal ──────────────────────────────────────────────────────

	describe('Change Detection Removal', () => {
		test('removeAllChangeDetection clears all callbacks', () => {
			coordinator.setupChangeDetection();
			coordinator.removeAllChangeDetection();
			expect(mockExtractor.getStreetCallback()).toBeNull();
			expect(mockExtractor.getNeighborhoodCallback()).toBeNull();
			expect(mockExtractor.getCityCallback()).toBeNull();
		});

		test('removeStreetChangeDetection clears only the street callback', () => {
			coordinator.setupChangeDetection();
			coordinator.removeStreetChangeDetection();
			expect(mockExtractor.getStreetCallback()).toBeNull();
			expect(mockExtractor.getNeighborhoodCallback()).not.toBeNull();
		});

		test('removeNeighborhoodChangeDetection clears only the neighborhood callback', () => {
			coordinator.setupChangeDetection();
			coordinator.removeNeighborhoodChangeDetection();
			expect(mockExtractor.getNeighborhoodCallback()).toBeNull();
			expect(mockExtractor.getCityCallback()).not.toBeNull();
		});

		test('removeCityChangeDetection clears only the city callback', () => {
			coordinator.setupChangeDetection();
			coordinator.removeCityChangeDetection();
			expect(mockExtractor.getCityCallback()).toBeNull();
			expect(mockExtractor.getNeighborhoodCallback()).not.toBeNull();
		});
	});

	// ── Handle* methods ───────────────────────────────────────────────────────

	describe('Change Event Handling', () => {
		test('handleStreetChange does not throw on a valid event', () => {
			const event = makeEvent('Rua Antiga', 'Rua Nova');
			expect(() => coordinator.handleStreetChange(event)).not.toThrow();
		});

		test('handleNeighborhoodChange does not throw on a valid event', () => {
			const event = makeEvent('Bairro Antigo', 'Bairro Novo');
			expect(() => coordinator.handleNeighborhoodChange(event)).not.toThrow();
		});

		test('handleCityChange does not throw on a valid event', () => {
			const event = makeEvent('São Paulo', 'Campinas');
			expect(() => coordinator.handleCityChange(event)).not.toThrow();
		});

		test('handleStreetChange logs error and does not throw when notification fails', () => {
			// Make functionObservers non-iterable to force an error inside _notifyObservers.
			(coordinator as { observerSubject: unknown }).observerSubject = {
				observers: [],
				functionObservers: null, // TypeError: null is not iterable
			};
			const event = makeEvent('A', 'B');
			expect(() => coordinator.handleStreetChange(event)).not.toThrow();
			expect(mockLogger.error).toHaveBeenCalledWith(
				expect.stringContaining('ChangeDetectionCoordinator'),
				expect.anything(),
			);
		});
	});

	// ── Observer notifications ────────────────────────────────────────────────

	describe('Observer Notifications', () => {
		test('street change calls observer.update with StreetChanged and event.to', () => {
			const observer = { update: jest.fn() };
			mockObserverSubject.subscribe(observer);

			const event = makeEvent('Rua Antiga', 'Rua Nova');
			coordinator.notifyStreetChangeObservers(event);

			expect(observer.update).toHaveBeenCalledWith(
				'Rua Nova', 'StreetChanged' as AddressChangeType, null, event,
			);
		});

		test('neighborhood change calls observer.update with NeighborhoodChanged and event.to', () => {
			const observer = { update: jest.fn() };
			mockObserverSubject.subscribe(observer);

			const event = makeEvent('Bairro Antigo', 'Bairro Novo');
			coordinator.notifyNeighborhoodChangeObservers(event);

			expect(observer.update).toHaveBeenCalledWith(
				'Bairro Novo', 'NeighborhoodChanged' as AddressChangeType, null, event,
			);
		});

		test('city change calls observer.update with CityChanged and event.to', () => {
			const observer = { update: jest.fn() };
			mockObserverSubject.subscribe(observer);

			const event = makeEvent('São Paulo', 'Campinas');
			coordinator.notifyCityChangeObservers(event);

			expect(observer.update).toHaveBeenCalledWith(
				'Campinas', 'CityChanged' as AddressChangeType, null, event,
			);
		});

		test('function observer receives GeoPosition, GeoAddress, and the typed event', () => {
			const fn = jest.fn();
			mockObserverSubject.subscribeFunction(fn);
			coordinator.setCurrentPosition(MOCK_POSITION);

			const event = makeEvent('Rua Antiga', 'Rua Nova');
			coordinator.notifyStreetChangeObservers(event);

			expect(fn).toHaveBeenCalledWith(MOCK_POSITION, ADDRESS_A, event);
		});

		test('function observer receives null position when position is not set', () => {
			const fn = jest.fn();
			mockObserverSubject.subscribeFunction(fn);

			const event = makeEvent('Rua Antiga', 'Rua Nova');
			coordinator.notifyStreetChangeObservers(event);

			expect(fn).toHaveBeenCalledWith(null, ADDRESS_A, event);
		});

		test('function observer receives currentAddress from addressState', () => {
			const fn = jest.fn();
			mockObserverSubject.subscribeFunction(fn);

			mockAddressState.currentAddress = ADDRESS_B;
			const event = makeEvent('A', 'B');
			coordinator.notifyStreetChangeObservers(event);

			expect(fn).toHaveBeenCalledWith(null, ADDRESS_B, event);
		});

		test('null observers list is treated as empty — no error logged', () => {
			(coordinator as { observerSubject: IObserverSubject }).observerSubject = {
				observers: null,
				functionObservers: [],
			};
			const event = makeEvent('A', 'B');
			expect(() => coordinator.notifyStreetChangeObservers(event)).not.toThrow();
			expect(mockLogger.error).not.toHaveBeenCalled();
		});

		test('a throwing function observer is isolated — subsequent observers still run', () => {
			const failing = jest.fn(() => { throw new Error('observer boom'); });
			const passing = jest.fn();
			mockObserverSubject.subscribeFunction(failing);
			mockObserverSubject.subscribeFunction(passing);

			const event = makeEvent('A', 'B');
			coordinator.notifyStreetChangeObservers(event);

			expect(failing).toHaveBeenCalled();
			expect(passing).toHaveBeenCalled();
			expect(mockLogger.error).toHaveBeenCalledWith(
				expect.stringContaining('Error notifying function observer'),
				expect.anything(),
			);
		});

		test('neighborhood change logs an info message', () => {
			coordinator.notifyNeighborhoodChangeObservers(makeEvent('A', 'B'));
			expect(mockLogger.info).toHaveBeenCalledWith(
				expect.stringContaining('neighborhood'),
			);
		});

		test('city change logs an info message', () => {
			coordinator.notifyCityChangeObservers(makeEvent('São Paulo', 'Campinas'));
			expect(mockLogger.info).toHaveBeenCalledWith(
				expect.stringContaining('city'),
			);
		});
	});

	// ── Integration with IAddressComponentExtractor ───────────────────────────

	describe('Integration with IAddressComponentExtractor', () => {
		test('extractor callback triggers handleStreetChange', () => {
			coordinator.setupStreetChangeDetection();
			const spy = jest.spyOn(coordinator, 'handleStreetChange');

			const event = makeEvent('Rua Antiga', 'Rua Nova');
			mockExtractor.getStreetCallback()!(event);

			expect(spy).toHaveBeenCalledWith(event);
			spy.mockRestore();
		});

		test('extractor callback triggers handleNeighborhoodChange', () => {
			coordinator.setupNeighborhoodChangeDetection();
			const spy = jest.spyOn(coordinator, 'handleNeighborhoodChange');

			const event = makeEvent('Bairro A', 'Bairro B');
			mockExtractor.getNeighborhoodCallback()!(event);

			expect(spy).toHaveBeenCalledWith(event);
			spy.mockRestore();
		});

		test('extractor callback triggers handleCityChange', () => {
			coordinator.setupCityChangeDetection();
			const spy = jest.spyOn(coordinator, 'handleCityChange');

			const event = makeEvent('São Paulo', 'Campinas');
			mockExtractor.getCityCallback()!(event);

			expect(spy).toHaveBeenCalledWith(event);
			spy.mockRestore();
		});

		test('removing a callback sets it to null in the extractor', () => {
			coordinator.setupStreetChangeDetection();
			coordinator.removeStreetChangeDetection();
			expect(mockExtractor.getStreetCallback()).toBeNull();
		});
	});

	// ── Typed event contract ──────────────────────────────────────────────────

	describe('Typed event contract (AddressFieldChangeEvent)', () => {
		test('event carries from, to, previousAddress and currentAddress', () => {
			const observer = { update: jest.fn() };
			mockObserverSubject.subscribe(observer);

			const event: AddressFieldChangeEvent = {
				from: 'Rua A', to: 'Rua B',
				previousAddress: ADDRESS_A, currentAddress: ADDRESS_B,
			};
			coordinator.notifyStreetChangeObservers(event);

			const received = (observer.update as jest.Mock).mock.calls[0][3] as AddressFieldChangeEvent;
			expect(received.from).toBe('Rua A');
			expect(received.to).toBe('Rua B');
			expect(received.previousAddress).toBe(ADDRESS_A);
			expect(received.currentAddress).toBe(ADDRESS_B);
		});

		test('event fields may be null (partial address data)', () => {
			const observer = { update: jest.fn() };
			mockObserverSubject.subscribe(observer);

			const event: AddressFieldChangeEvent = {
				from: null, to: null, previousAddress: null, currentAddress: null,
			};
			expect(() => coordinator.notifyStreetChangeObservers(event)).not.toThrow();
		});
	});

	// ── Separation of concerns ────────────────────────────────────────────────

	describe('Separation of Concerns', () => {
		test('coordinator can be instantiated without any external runtime dependency', () => {
			const c = new ChangeDetectionCoordinator({
				addressState:    { currentAddress: null },
				observerSubject: new MockObserverSubject(),
				logger:          makeLogger(),
			});
			expect(c).toBeDefined();
			expect(c.setupChangeDetection).toBeDefined();
		});

		test('multiple independent instances share no state', () => {
			const obs1 = new MockObserverSubject();
			const obs2 = new MockObserverSubject();
			const c1 = new ChangeDetectionCoordinator({ addressState: mockAddressState, observerSubject: obs1, logger: mockLogger });
			const c2 = new ChangeDetectionCoordinator({ addressState: mockAddressState, observerSubject: obs2, logger: mockLogger });

			const observer1 = { update: jest.fn() };
			const observer2 = { update: jest.fn() };
			obs1.subscribe(observer1);
			obs2.subscribe(observer2);

			c1.notifyStreetChangeObservers(makeEvent('A', 'B'));

			expect(observer1.update).toHaveBeenCalledTimes(1);
			expect(observer2.update).not.toHaveBeenCalled();
		});
	});
});
