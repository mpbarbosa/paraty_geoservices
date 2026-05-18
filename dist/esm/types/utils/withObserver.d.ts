/**
 * Observer-pattern mixin delegating subscribe/unsubscribe to `observerSubject`.
 *
 * @module utils/withObserver
 * @since 1.6.0
 */
export interface ObserverMixinOptions {
    checkNull?: boolean;
    className?: string;
    excludeNotify?: boolean;
}
export declare function withObserver(options?: ObserverMixinOptions): Record<string, (...args: unknown[]) => void>;
export default withObserver;
