"use strict";
/**
 * Port interface for reverse geocoding providers.
 *
 * Application code depends on this abstraction rather than on any concrete
 * implementation, enabling provider substitution via dependency injection.
 *
 * **Naming note:** This is the domain **port** (`ReverseGeocoder` interface).
 * The application-layer orchestrator class (Nominatim + AWS + observers) lives
 * at `src/application/services/ReverseGeocoder.ts` and is exported from the
 * package root as {@link ReverseGeocoderService} to avoid clashing with this port.
 *
 * @module domain/ports/ReverseGeocoder
 * @since 1.2.5
 * @author Marcelo Pereira Barbosa
 */
Object.defineProperty(exports, "__esModule", { value: true });
//# sourceMappingURL=ReverseGeocoder.js.map