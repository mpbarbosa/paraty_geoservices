import { afterEach, describe, expect, jest, test } from '@jest/globals';
import { ObserverSubject } from '../application/ObserverSubject';
import { withObserver } from './withObserver';

type MixedObserverHost = {
	observerSubject: ObserverSubject;
	subscribe(observer: unknown): void;
	unsubscribe(observer: unknown): void;
	notifyObservers(...args: unknown[]): void;
};

function createHost(options?: Parameters<typeof withObserver>[0]): MixedObserverHost {
	const host = {
		observerSubject: new ObserverSubject(),
	} as MixedObserverHost;

	Object.assign(host, withObserver(options));

	return host;
}

describe('withObserver', () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	test('warns and ignores null subscriptions when checkNull is enabled', () => {
		const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
		const host = createHost({ checkNull: true, className: 'TestHost' });

		host.subscribe(null);

		expect(warnSpy).toHaveBeenCalledWith(
			'(TestHost) Attempted to subscribe a null observer.',
		);
		expect(host.observerSubject.observers).toEqual([]);
	});

	test('delegates unsubscribe to the observer subject', () => {
		const host = createHost();
		const observer = { update: jest.fn() };

		host.subscribe(observer);
		host.unsubscribe(observer);

		expect(host.observerSubject.observers).toEqual([]);
	});

	test('adds notifyObservers by default', () => {
		const host = createHost();
		const observer = { update: jest.fn() };

		host.subscribe(observer);
		host.notifyObservers('updated', 123);

		expect(observer.update).toHaveBeenCalledWith('updated', 123);
	});

	test('omits notifyObservers when excludeNotify is true', () => {
		const host = createHost({ excludeNotify: true }) as MixedObserverHost & {
			notifyObservers?: (...args: unknown[]) => void;
		};

		expect(host.notifyObservers).toBeUndefined();
	});
});
