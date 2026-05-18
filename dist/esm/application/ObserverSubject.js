/**
 * Minimal observer container for application services.
 *
 * @module application/ObserverSubject
 * @since 1.6.0
 */
/**
 * Subject that manages observer subscriptions and broadcasts notifications.
 */
export class ObserverSubject {
    constructor() {
        this.observers = [];
    }
    subscribe(observer) {
        if (!observer || this.observers.includes(observer)) {
            return;
        }
        this.observers.push(observer);
    }
    unsubscribe(observer) {
        this.observers = this.observers.filter((o) => o !== observer);
    }
    notifyObservers(...args) {
        for (const observer of [...this.observers]) {
            observer.update?.(...args);
        }
    }
}
