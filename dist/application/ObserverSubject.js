"use strict";
/**
 * Minimal observer container for application services.
 *
 * @module application/ObserverSubject
 * @since 1.6.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObserverSubject = void 0;
/**
 * Subject that manages observer subscriptions and broadcasts notifications.
 */
class ObserverSubject {
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
exports.ObserverSubject = ObserverSubject;
//# sourceMappingURL=ObserverSubject.js.map