"use strict";
/**
 * Abstract port that all geolocation providers must implement.
 *
 * ARCHITECTURAL OVERVIEW:
 * This is the inbound/outbound port in the domain layer. The application layer
 * depends only on this abstraction — never on concrete implementations — enabling
 * dependency injection, easy testability, and provider substitution at runtime.
 *
 * DESIGN PRINCIPLES:
 * - Interface Segregation: Minimal, focused API for geolocation operations
 * - Dependency Inversion: Consumers depend on this abstraction, not on concrete implementations
 * - Open/Closed: Open for extension (new providers), closed for modification
 *
 * @module domain/ports/GeolocationProvider
 * @since 1.0.2
 * @author Marcelo Pereira Barbosa
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeolocationProvider = void 0;
/**
 * Abstract base class (port) for geolocation providers.
 *
 * Extend this class and implement all four abstract methods to integrate a
 * new location source (e.g. browser Geolocation API, GPS hardware, mock).
 *
 * @abstract
 * @class GeolocationProvider
 *
 * @example
 * class BrowserGeolocationProvider extends GeolocationProvider {
 *   getCurrentPosition(success, error, options) {
 *     navigator.geolocation.getCurrentPosition(success, error, options);
 *   }
 *   watchPosition(success, error, options) {
 *     return navigator.geolocation.watchPosition(success, error, options);
 *   }
 *   clearWatch(watchId) {
 *     navigator.geolocation.clearWatch(watchId);
 *   }
 *   isSupported() {
 *     return 'geolocation' in navigator;
 *   }
 * }
 */
class GeolocationProvider {
}
exports.GeolocationProvider = GeolocationProvider;
exports.default = GeolocationProvider;
//# sourceMappingURL=GeolocationProvider.js.map