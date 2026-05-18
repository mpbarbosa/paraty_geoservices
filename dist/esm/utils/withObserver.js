/**
 * Observer-pattern mixin delegating subscribe/unsubscribe to `observerSubject`.
 *
 * @module utils/withObserver
 * @since 1.6.0
 */
export function withObserver(options = {}) {
    const { checkNull = false, className = 'Class', excludeNotify = false } = options;
    const mixin = {
        subscribe(observer) {
            if (checkNull && observer == null) {
                console.warn(`(${className}) Attempted to subscribe a null observer.`);
                return;
            }
            this.observerSubject.subscribe(observer);
        },
        unsubscribe(observer) {
            this.observerSubject.unsubscribe(observer);
        },
    };
    if (!excludeNotify) {
        mixin.notifyObservers = function (...args) {
            this.observerSubject.notifyObservers(...args);
        };
    }
    return mixin;
}
export default withObserver;
