
import type { GeoAddress } from '../../domain/entities/GeoAddress';
import type { GeoPosition } from '../../domain/entities/GeoPosition';

// ── Application-layer ports ───────────────────────────────────────────────────

/** Typed change event emitted whenever a single address field transitions. */
export interface AddressFieldChangeEvent {
	from: string | null;
	to: string | null;
	previousAddress: GeoAddress | null;
	currentAddress: GeoAddress | null;
}

/** Discriminated union of change types emitted by the coordinator. */
export type AddressChangeType = 'StreetChanged' | 'NeighborhoodChanged' | 'CityChanged';

/** Object-style observer that receives individual field changes. */
export interface IAddressChangeObserver {
	update(
		newValue: string | null,
		changeType: AddressChangeType,
		reserved: null,
		event: AddressFieldChangeEvent,
	): void;
}

/**
 * Narrow port for the observer container.
 * Replaces the concrete CDN `DualObserverSubject` dependency.
 */
export interface IObserverSubject {
	observers: IAddressChangeObserver[] | null;
	functionObservers: Array<(
		position: GeoPosition | null,
		address: GeoAddress | null,
		event: AddressFieldChangeEvent,
	) => void>;
}

/**
 * Port for the address-component change source.
 * Uses domain-language method names; infrastructure adapters bridge to any
 * locale-specific external API (e.g. the CDN AddressDataExtractor).
 */
export interface IAddressComponentExtractor {
	setStreetChangeCallback(cb: ((event: AddressFieldChangeEvent) => void) | null): void;
	setNeighborhoodChangeCallback(cb: ((event: AddressFieldChangeEvent) => void) | null): void;
	setCityChangeCallback(cb: ((event: AddressFieldChangeEvent) => void) | null): void;
}

/** Narrow read-only view of the geocoding result held by the caller. */
export interface IAddressState {
	currentAddress: GeoAddress | null;
}

/** Narrow logging port — prevents direct dependency on any concrete logger. */
export interface ILogger {
	warn(message: string, ...args: unknown[]): void;
	error(message: string, ...args: unknown[]): void;
	info(message: string, ...args: unknown[]): void;
}

// ── Coordinator ───────────────────────────────────────────────────────────────

/**
 * Coordinates address-component change detection and observer notification.
 *
 * Depends only on locally-defined application-layer ports; concrete
 * collaborators (logger, observer container, extractor) are injected at
 * construction/wiring time so the application layer stays free of CDN
 * or infrastructure imports.
 *
 * @since 0.9.0-alpha
 */
class ChangeDetectionCoordinator {
	public addressState: IAddressState;
	public observerSubject: IObserverSubject;
	public currentPosition: GeoPosition | null;
	private extractor: IAddressComponentExtractor | null;
	private logger: ILogger;

	constructor(params: {
		addressState: IAddressState;
		observerSubject: IObserverSubject;
		logger: ILogger;
	}) {
		this.addressState = params.addressState;
		this.observerSubject = params.observerSubject;
		this.logger = params.logger;
		this.currentPosition = null;
		this.extractor = null;
	}

	/** Injects the address-component extractor. Call once during wiring. */
	setAddressComponentExtractor(extractor: IAddressComponentExtractor): void {
		this.extractor = extractor;
	}

	/** Updates the cached position forwarded to function observers. */
	setCurrentPosition(position: GeoPosition | null): void {
		this.currentPosition = position;
	}

	// ── Lifecycle ─────────────────────────────────────────────────────────────

	setupChangeDetection(): void {
		this.setupStreetChangeDetection();
		this.setupNeighborhoodChangeDetection();
		this.setupCityChangeDetection();
	}

	removeAllChangeDetection(): void {
		this.removeStreetChangeDetection();
		this.removeNeighborhoodChangeDetection();
		this.removeCityChangeDetection();
	}

	// ── Per-field setup / removal ─────────────────────────────────────────────

	setupStreetChangeDetection(): void {
		if (!this.extractor) {
			this.logger.warn('(ChangeDetectionCoordinator) Address component extractor not available');
			return;
		}
		this.extractor.setStreetChangeCallback((event) => this.handleStreetChange(event));
	}

	removeStreetChangeDetection(): void {
		this.extractor?.setStreetChangeCallback(null);
	}

	setupNeighborhoodChangeDetection(): void {
		if (!this.extractor) {
			this.logger.warn('(ChangeDetectionCoordinator) Address component extractor not available');
			return;
		}
		this.extractor.setNeighborhoodChangeCallback((event) => this.handleNeighborhoodChange(event));
	}

	removeNeighborhoodChangeDetection(): void {
		this.extractor?.setNeighborhoodChangeCallback(null);
	}

	setupCityChangeDetection(): void {
		if (!this.extractor) {
			this.logger.warn('(ChangeDetectionCoordinator) Address component extractor not available');
			return;
		}
		this.extractor.setCityChangeCallback((event) => this.handleCityChange(event));
	}

	removeCityChangeDetection(): void {
		this.extractor?.setCityChangeCallback(null);
	}

	// ── Change handlers (called by extractor callbacks) ───────────────────────

	handleStreetChange(event: AddressFieldChangeEvent): void {
		try {
			this.notifyStreetChangeObservers(event);
		} catch (err) {
			this.logger.error('(ChangeDetectionCoordinator) Error handling street change', err);
		}
	}

	handleNeighborhoodChange(event: AddressFieldChangeEvent): void {
		try {
			this.notifyNeighborhoodChangeObservers(event);
		} catch (err) {
			this.logger.error('(ChangeDetectionCoordinator) Error handling neighborhood change', err);
		}
	}

	handleCityChange(event: AddressFieldChangeEvent): void {
		try {
			this.notifyCityChangeObservers(event);
		} catch (err) {
			this.logger.error('(ChangeDetectionCoordinator) Error handling city change', err);
		}
	}

	// ── Public notification API ───────────────────────────────────────────────

	notifyStreetChangeObservers(event: AddressFieldChangeEvent): void {
		this._notifyObservers(event, 'StreetChanged', event.to);
	}

	notifyNeighborhoodChangeObservers(event: AddressFieldChangeEvent): void {
		this.logger.info('(ChangeDetectionCoordinator) Notifying observers of neighborhood change.');
		this._notifyObservers(event, 'NeighborhoodChanged', event.to);
	}

	notifyCityChangeObservers(event: AddressFieldChangeEvent): void {
		this.logger.info('(ChangeDetectionCoordinator) Notifying observers of city change.');
		this._notifyObservers(event, 'CityChanged', event.to);
	}

	// ── Private dispatch ──────────────────────────────────────────────────────

	private _notifyObservers(
		event: AddressFieldChangeEvent,
		changeType: AddressChangeType,
		changeData: string | null,
	): void {
		for (const observer of this.observerSubject.observers ?? []) {
			if (typeof observer.update === 'function') {
				observer.update(changeData, changeType, null, event);
			}
		}
		this._notifyFunctionObservers(event, changeType);
	}

	private _notifyFunctionObservers(event: AddressFieldChangeEvent, changeType: AddressChangeType): void {
		for (const fn of this.observerSubject.functionObservers) {
			try {
				fn(this.currentPosition, this.addressState.currentAddress, event);
			} catch (err) {
				this.logger.error(
					`(ChangeDetectionCoordinator) Error notifying function observer about ${changeType}`,
					err,
				);
			}
		}
	}
}

export default ChangeDetectionCoordinator;
export { ChangeDetectionCoordinator };
