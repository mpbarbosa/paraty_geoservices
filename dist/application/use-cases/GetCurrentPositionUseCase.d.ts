/**
 * Use case: acquire the device's current geographic position once.
 *
 * Wraps the callback-based GeolocationProvider port in a Promise, giving
 * callers a clean async/await interface.
 *
 * @module application/use-cases/GetCurrentPositionUseCase
 * @since 1.0.2
 * @author Marcelo Pereira Barbosa
 */
import type GeolocationProvider from '../../domain/ports/GeolocationProvider';
import type { GeoPositionOptions } from '../../domain/entities/GeoPositionOptions';
import type { GetCurrentPositionOutput } from '../dtos/GetCurrentPositionOutput';
export declare class GetCurrentPositionUseCase {
    private readonly provider;
    constructor(provider: GeolocationProvider);
    /**
     * Requests the current position from the injected provider.
     *
     * @param options - Optional accuracy, timeout and cache settings.
     * @returns A Promise that resolves with the acquired position or rejects with a GeoPositionError.
     *
     * @example
     * const useCase = new GetCurrentPositionUseCase(provider);
     * const { position } = await useCase.execute({ enableHighAccuracy: true });
     * console.log(position.coords.latitude);
     */
    execute(options?: GeoPositionOptions): Promise<GetCurrentPositionOutput>;
}
//# sourceMappingURL=GetCurrentPositionUseCase.d.ts.map