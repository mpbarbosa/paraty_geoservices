/**
 * Observer-pattern mixin delegating subscribe/unsubscribe to `observerSubject`.
 *
 * @module utils/withObserver
 * @since 1.6.0
 */

import type { ObserverSubject } from '../application/ObserverSubject';

export interface ObserverMixinOptions {
	checkNull?: boolean;
	className?: string;
	excludeNotify?: boolean;
}

export function withObserver(
	options: ObserverMixinOptions = {},
): Record<string, (...args: unknown[]) => void> {
	const { checkNull = false, className = 'Class', excludeNotify = false } = options;

	const mixin: Record<string, (...args: unknown[]) => void> = {
		subscribe(observer: unknown) {
			if (checkNull && observer == null) {
				console.warn(`(${className}) Attempted to subscribe a null observer.`);
				return;
			}
			(this as unknown as { observerSubject: ObserverSubject }).observerSubject.subscribe(
				observer as { update?: (...args: unknown[]) => void },
			);
		},

		unsubscribe(observer: unknown) {
			(this as unknown as { observerSubject: ObserverSubject }).observerSubject.unsubscribe(
				observer as { update?: (...args: unknown[]) => void },
			);
		},
	};

	if (!excludeNotify) {
		mixin.notifyObservers = function (...args: unknown[]) {
			(this as unknown as { observerSubject: ObserverSubject }).observerSubject.notifyObservers(
				...args,
			);
		};
	}

	return mixin;
}

export default withObserver;
