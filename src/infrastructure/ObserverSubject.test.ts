import { describe, expect, test } from '@jest/globals';
import { ObserverSubject } from './ObserverSubject';

describe('infrastructure/ObserverSubject', () => {
	test('re-exports the application observer subject', () => {
		const subject = new ObserverSubject();

		expect(subject).toBeInstanceOf(ObserverSubject);
	});
});
