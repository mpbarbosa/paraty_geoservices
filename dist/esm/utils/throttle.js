/**
 * @fileoverview Throttle higher-order function — limits how often a function can be called.
 * @module utils/throttle
 * @license MIT
 * @author Marcelo Pereira Barbosa
 *
 * Adapted from guia_js/src/utils/throttle.ts (same interface and behaviour).
 * @see https://github.com/mpbarbosa/guia.js/blob/main/src/utils/throttle.ts
 */
/**
 * Creates a throttled version of `fn` that executes at most once per `wait` milliseconds
 * (leading-edge strategy: the first call in each window fires immediately).
 *
 * Calls made while the cooldown is active are silently dropped and return `undefined`.
 * Use the returned `flush()` method to reset the cooldown on demand.
 *
 * @template TArgs - Tuple of argument types of the wrapped function
 * @template TReturn - Return type of the wrapped function
 *
 * @param {(...args: TArgs) => TReturn} fn - The function to throttle
 * @param {number} wait - Minimum milliseconds between executions (must be ≥ 0)
 * @returns {ThrottledFunction<TArgs, TReturn>} Throttled wrapper with a `flush()` escape hatch
 *
 * @throws {TypeError} When `fn` is not a function or `wait` is not a non-negative number
 *
 * @example
 * const throttledHandler = throttle((position: GeoPosition) => {
 *   processPosition(position);
 * }, 5000);
 *
 * @example
 * // Force the next call through regardless of the cooldown
 * throttledHandler.flush();
 *
 * @since 1.4.0
 */
export function throttle(fn, wait) {
    if (typeof fn !== 'function') {
        throw new TypeError('throttle: first argument must be a function');
    }
    if (typeof wait !== 'number' || wait < 0 || !isFinite(wait)) {
        throw new TypeError('throttle: wait must be a non-negative finite number');
    }
    let lastCall = 0;
    const throttled = (...args) => {
        const now = Date.now();
        if (now - lastCall >= wait) {
            lastCall = now;
            return fn(...args);
        }
        return undefined;
    };
    throttled.flush = () => {
        lastCall = 0;
    };
    return throttled;
}
