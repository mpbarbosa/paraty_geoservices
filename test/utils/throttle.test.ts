import { throttle, ThrottledFunction } from '../../src/utils/throttle';

describe('throttle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(10_000);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call the function immediately on first call', () => {
    const fn = jest.fn((x: number) => x * 2);
    const throttled = throttle(fn, 1000);
    expect(throttled(2)).toBe(4);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should drop calls within the wait period', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 1000);
    throttled('a');
    throttled('b');
    throttled('c');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(throttled('d')).toBeUndefined();
  });

  it('should call the function again after wait period', () => {
    const fn = jest.fn((x: string) => x);
    const throttled = throttle(fn, 1000);
    throttled('first');
    jest.advanceTimersByTime(999);
    expect(throttled('second')).toBeUndefined();
    jest.advanceTimersByTime(1);
    expect(throttled('third')).toBe('third');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should reset cooldown with flush()', () => {
    const fn = jest.fn((x: number) => x);
    const throttled = throttle(fn, 1000);
    throttled(1);
    throttled(2);
    throttled.flush();
    expect(throttled(3)).toBe(3);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should work with wait = 0 (no throttling)', () => {
    const fn = jest.fn((x: number) => x);
    const throttled = throttle(fn, 0);
    throttled(1);
    throttled(2);
    throttled(3);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should throw if fn is not a function', () => {
    // @ts-expect-error
    expect(() => throttle(undefined, 1000)).toThrow('throttle: first argument must be a function');
    // @ts-expect-error
    expect(() => throttle(123, 1000)).toThrow('throttle: first argument must be a function');
  });

  it('should throw if wait is negative or not a finite number', () => {
    const fn = jest.fn();
    expect(() => throttle(fn, -1)).toThrow('throttle: wait must be a non-negative finite number');
    expect(() => throttle(fn, Infinity)).toThrow('throttle: wait must be a non-negative finite number');
    // @ts-expect-error
    expect(() => throttle(fn, 'foo')).toThrow('throttle: wait must be a non-negative finite number');
  });

  it('should type the returned function as ThrottledFunction', () => {
    const fn = (a: string, b: number): string => `${a}:${b}`;
    const throttled: ThrottledFunction<[string, number], string> = throttle(fn, 100);
    expect(typeof throttled.flush).toBe('function');
    expect(throttled('x', 1)).toBe('x:1');
  });

  it('should not share state between different throttled functions', () => {
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    const throttled1 = throttle(fn1, 1000);
    const throttled2 = throttle(fn2, 1000);
    throttled1();
    throttled2();
    throttled1();
    throttled2();
    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn2).toHaveBeenCalledTimes(1);
  });

  it('should handle edge case: multiple flush calls', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 1000);
    throttled();
    throttled.flush();
    throttled.flush();
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
