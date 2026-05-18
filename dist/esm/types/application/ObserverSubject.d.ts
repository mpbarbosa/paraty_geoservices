/**
 * Minimal observer container for application services.
 *
 * @module application/ObserverSubject
 * @since 1.6.0
 */
export interface ObserverLike {
    update?: (...args: unknown[]) => void;
}
/**
 * Subject that manages observer subscriptions and broadcasts notifications.
 */
export declare class ObserverSubject {
    observers: ObserverLike[];
    subscribe(observer: ObserverLike): void;
    unsubscribe(observer: ObserverLike): void;
    notifyObservers(...args: unknown[]): void;
}
