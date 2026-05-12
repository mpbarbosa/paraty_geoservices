/**
 * Use case: continuously watch the device's geographic position for changes.
 *
 * Manages the lifecycle of a position watch on the injected GeolocationProvider port:
 * start a watch (receiving updates via callback) and stop it when no longer needed.
 *
 * @module application/use-cases/WatchPositionUseCase
 * @since 1.0.2
 * @author Marcelo Pereira Barbosa
 */
import type GeolocationProvider from '../../domain/ports/GeolocationProvider';
import type { GeoPosition } from '../../domain/entities/GeoPosition';
import type { GeoPositionError } from '../../domain/entities/GeoPositionError';
import type { GeoPositionOptions } from '../../domain/entities/GeoPositionOptions';
export declare class WatchPositionUseCase {
    private readonly provider;
    private watchId;
    constructor(provider: GeolocationProvider);
    /**
     * Starts watching for position updates.
     * Calling `start` while a watch is already active stops the previous watch first.
     *
     * @param onUpdate  - Invoked on every new position fix.
     * @param onError   - Invoked when an error occurs.
     * @param options   - Optional accuracy, timeout and cache settings.
     *
     * @example
     * const useCase = new WatchPositionUseCase(provider);
     * useCase.start(
     *   (pos) => console.log(pos.coords),
     *   (err) => console.error(err.message),
     * );
     */
    start(onUpdate: (pos: GeoPosition) => void, onError: (err: GeoPositionError) => void, options?: GeoPositionOptions): void;
    /**
     * Stops watching for position updates.
     * Safe to call even if no watch is active.
     *
     * @example
     * useCase.stop();
     */
    stop(): void;
    /** Returns `true` if a watch is currently active. */
    get isWatching(): boolean;
}
//# sourceMappingURL=WatchPositionUseCase.d.ts.map