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
export class ObserverSubject {
	observers: ObserverLike[] = [];

	subscribe(observer: ObserverLike): void {
		if (!observer || this.observers.includes(observer)) {
			return;
		}
		this.observers.push(observer);
	}

	unsubscribe(observer: ObserverLike): void {
		this.observers = this.observers.filter((o) => o !== observer);
	}

	notifyObservers(...args: unknown[]): void {
		for (const observer of [...this.observers]) {
			observer.update?.(...args);
		}
	}
}
