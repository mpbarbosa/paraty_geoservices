/**
 * Output DTO for the GetCurrentPosition use case.
 *
 * Wraps the domain GeoPosition so the application layer controls
 * what data crosses the boundary into callers.
 *
 * @module application/dtos/GetCurrentPositionOutput
 * @since 1.0.2
 * @author Marcelo Pereira Barbosa
 */
import type { GeoPosition } from '../../domain/entities/GeoPosition';
export interface GetCurrentPositionOutput {
    /** Acquired geographic position. */
    position: GeoPosition;
}
//# sourceMappingURL=GetCurrentPositionOutput.d.ts.map