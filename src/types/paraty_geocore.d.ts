// Minimal type stub for paraty_geocore.js CDN package.
// Used as a fallback when the sibling repo is not present (e.g. Docker / CI).

export type AccuracyQuality = 'excellent' | 'good' | 'medium' | 'bad' | 'very bad';

export interface GeoCoords {
    latitude?: number;
    longitude?: number;
    accuracy?: number;
    altitude?: number | null;
    altitudeAccuracy?: number | null;
    heading?: number | null;
    speed?: number | null;
}

export interface GeoPositionInput {
    timestamp?: number;
    coords?: GeoCoords;
}

export declare class GeoPosition {
    readonly coords: Readonly<GeoCoords> | null;
    readonly latitude: number | undefined;
    readonly longitude: number | undefined;
    readonly accuracy: number | undefined;
    readonly accuracyQuality: AccuracyQuality;
    readonly altitude: number | null | undefined;
    readonly altitudeAccuracy: number | null | undefined;
    readonly heading: number | null | undefined;
    readonly speed: number | null | undefined;
    readonly timestamp: number | undefined;
    constructor(position: GeoPositionInput);
    static from(position: GeoPositionInput): GeoPosition;
    static getAccuracyQuality(accuracy: number): AccuracyQuality;
    distanceTo(otherPosition: { latitude: number; longitude: number }): number;
}

export declare class GeoPositionError extends Error {
    constructor(message: string);
}

export declare class ObserverSubject {
    observers: Array<{ update?: (...args: unknown[]) => void }>;
    subscribe(observer: { update?: (...args: unknown[]) => void }): void;
    unsubscribe(observer: { update?: (...args: unknown[]) => void }): void;
    notifyObservers(...args: unknown[]): void;
}

export declare class DualObserverSubject<T extends unknown[] = unknown[]> {
    observers: Array<{ update?: (...args: T) => void }> | null;
    functionObservers: Array<(...args: T) => void>;
}

export interface ObserverMixinOptions {
    checkNull?: boolean;
    className?: string;
    excludeNotify?: boolean;
}

export interface ObserverMixinResult {
    subscribe(observer: unknown): void;
    unsubscribe(observer: unknown): void;
    notifyObservers?(...args: unknown[]): void;
}

export declare function withObserver(options?: ObserverMixinOptions): ObserverMixinResult;

export interface GeocodingStateSnapshot {
    position: GeoPosition | null;
    coordinates: Readonly<{ latitude: number; longitude: number }> | null;
}

export declare class GeocodingState extends ObserverSubject {
    setPosition(position: GeoPosition | null): GeocodingState;
    getCurrentPosition(): GeoPosition | null;
    getCurrentCoordinates(): Readonly<{ latitude: number; longitude: number }> | null;
    hasPosition(): boolean;
    clear(): void;
}

export interface PositionManagerConfig {
    trackingInterval: number;
    minimumDistanceChange: number;
    minimumTimeChange: number;
    notAcceptedAccuracy: AccuracyQuality[] | null;
}

export declare class PositionManager {
    static instance: PositionManager | null;
    static strCurrPosUpdate: string;
    static strCurrPosNotUpdate: string;
    static strImmediateAddressUpdate: string;
    lastPosition: GeoPosition | null;
    readonly latitude: number | undefined;
    readonly longitude: number | undefined;
    readonly accuracy: number | undefined;
    readonly accuracyQuality: AccuracyQuality | undefined;
    declare subscribe: (observer: { update?: (...args: unknown[]) => void }) => void;
    declare unsubscribe: (observer: { update?: (...args: unknown[]) => void }) => void;
    static getInstance(position?: GeoPositionInput): PositionManager;
    update(position: GeoPositionInput): void;
    notifyObservers(posEvent: string, data?: unknown, error?: unknown): void;
    setBypassDistanceRule(bypass: boolean): void;
    readonly bypassDistanceRule: boolean;
}

export declare function createPositionManagerConfig(): PositionManagerConfig;
export declare function initializeConfig(config: Partial<PositionManagerConfig>): void;

export interface OsmElement {
    class?: string;
    type?: string;
    name?: string;
    [key: string]: unknown;
}

export declare const NO_REFERENCE_PLACE: string;
export declare const VALID_REF_PLACE_CLASSES: ReadonlyArray<string>;

export declare class ReferencePlace {
    readonly className: string | null;
    readonly typeName: string | null;
    readonly name: string | null;
    readonly description: string;
    constructor(data: OsmElement | null | undefined);
    calculateDescription(): string;
    calculateCategory(): string;
}

export declare const EARTH_RADIUS_METERS: number;
export declare function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number;
export declare function delay(ms: number): Promise<void>;
export declare function log(...args: unknown[]): void;
export declare function warn(...args: unknown[]): void;
