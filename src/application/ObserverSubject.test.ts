import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { ObserverSubject } from './ObserverSubject';

describe('ObserverSubject', () => {
	let subject: ObserverSubject;
	let observer: { update: jest.Mock };

	beforeEach(() => {
		subject = new ObserverSubject();
		observer = { update: jest.fn() };
	});

	test('ignores null and duplicate subscriptions', () => {
		subject.subscribe(observer);
		subject.subscribe(observer);
		subject.subscribe(null as never);

		expect(subject.observers).toEqual([observer]);
	});

	test('unsubscribes existing observers', () => {
		subject.subscribe(observer);
		subject.unsubscribe(observer);

		expect(subject.observers).toEqual([]);
	});

	test('notifies subscribed observers', () => {
		subject.subscribe(observer);
		subject.notifyObservers('event', { ok: true });

		expect(observer.update).toHaveBeenCalledWith('event', { ok: true });
	});
});
