import { describe, expect, test, jest } from '@jest/globals';
import { ObserverSubject } from './ObserverSubject';

describe('ObserverSubject', () => {
	test('ignores null and duplicate subscriptions', () => {
		const subject = new ObserverSubject();
		const observer = { update: jest.fn() };

		subject.subscribe(observer);
		subject.subscribe(observer);
		subject.subscribe(null as never);

		expect(subject.observers).toEqual([observer]);
	});

	test('unsubscribes existing observers', () => {
		const subject = new ObserverSubject();
		const observer = { update: jest.fn() };

		subject.subscribe(observer);
		subject.unsubscribe(observer);

		expect(subject.observers).toEqual([]);
	});

	test('notifies subscribed observers', () => {
		const subject = new ObserverSubject();
		const observer = { update: jest.fn() };

		subject.subscribe(observer);
		subject.notifyObservers('event', { ok: true });

		expect(observer.update).toHaveBeenCalledWith('event', { ok: true });
	});
});
