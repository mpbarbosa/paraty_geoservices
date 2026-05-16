import type { GeoAddress } from '../../domain/entities/GeoAddress';
import type { GeoPosition } from '../../domain/entities/GeoPosition';
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
    update(newValue: string | null, changeType: AddressChangeType, reserved: null, event: AddressFieldChangeEvent): void;
}
/**
 * Narrow port for the observer container.
 * Replaces the concrete CDN `DualObserverSubject` dependency.
 */
export interface IObserverSubject {
    observers: IAddressChangeObserver[] | null;
    functionObservers: Array<(position: GeoPosition | null, address: GeoAddress | null, event: AddressFieldChangeEvent) => void>;
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
declare class ChangeDetectionCoordinator {
    addressState: IAddressState;
    observerSubject: IObserverSubject;
    currentPosition: GeoPosition | null;
    private extractor;
    private logger;
    constructor(params: {
        addressState: IAddressState;
        observerSubject: IObserverSubject;
        logger: ILogger;
    });
    /** Injects the address-component extractor. Call once during wiring. */
    setAddressComponentExtractor(extractor: IAddressComponentExtractor): void;
    /** Updates the cached position forwarded to function observers. */
    setCurrentPosition(position: GeoPosition | null): void;
    setupChangeDetection(): void;
    removeAllChangeDetection(): void;
    setupStreetChangeDetection(): void;
    removeStreetChangeDetection(): void;
    setupNeighborhoodChangeDetection(): void;
    removeNeighborhoodChangeDetection(): void;
    setupCityChangeDetection(): void;
    removeCityChangeDetection(): void;
    handleStreetChange(event: AddressFieldChangeEvent): void;
    handleNeighborhoodChange(event: AddressFieldChangeEvent): void;
    handleCityChange(event: AddressFieldChangeEvent): void;
    notifyStreetChangeObservers(event: AddressFieldChangeEvent): void;
    notifyNeighborhoodChangeObservers(event: AddressFieldChangeEvent): void;
    notifyCityChangeObservers(event: AddressFieldChangeEvent): void;
    private _notifyObservers;
    private _notifyFunctionObservers;
}
export default ChangeDetectionCoordinator;
export { ChangeDetectionCoordinator };
