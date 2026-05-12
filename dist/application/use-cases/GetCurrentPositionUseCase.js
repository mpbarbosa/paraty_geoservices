"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCurrentPositionUseCase = void 0;
class GetCurrentPositionUseCase {
    constructor(provider) {
        this.provider = provider;
    }
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
    execute(options) {
        return new Promise((resolve, reject) => {
            this.provider.getCurrentPosition((pos) => resolve({ position: pos }), reject, options);
        });
    }
}
exports.GetCurrentPositionUseCase = GetCurrentPositionUseCase;
//# sourceMappingURL=GetCurrentPositionUseCase.js.map