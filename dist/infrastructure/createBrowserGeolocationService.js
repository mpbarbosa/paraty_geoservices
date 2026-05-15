"use strict";
/**
 * Browser-oriented factory for the high-level geolocation service.
 *
 * Keeps browser-specific provider construction in the infrastructure layer while
 * preserving a convenient entry point for browser consumers.
 *
 * @module infrastructure/createBrowserGeolocationService
 * @since 1.3.0
 * @author Marcelo Pereira Barbosa
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBrowserGeolocationService = createBrowserGeolocationService;
const GeolocationService_1 = require("../application/services/GeolocationService");
const BrowserGeolocationProvider_1 = require("./providers/BrowserGeolocationProvider");
/**
 * Creates a `GeolocationService` pre-wired with `BrowserGeolocationProvider`.
 *
 * When `navigator` is omitted, the provider resolves the ambient global
 * `navigator` at call time. When the property is present, its value is used
 * exactly as supplied, including `null` or `undefined`.
 */
function createBrowserGeolocationService(config = {}) {
    const { navigator: injectedNavigator, ...serviceConfig } = config;
    const hasNavigatorOverride = Object.prototype.hasOwnProperty.call(config, 'navigator');
    const provider = hasNavigatorOverride
        ? new BrowserGeolocationProvider_1.BrowserGeolocationProvider(injectedNavigator)
        : new BrowserGeolocationProvider_1.BrowserGeolocationProvider();
    return new GeolocationService_1.GeolocationService(provider, serviceConfig);
}
//# sourceMappingURL=createBrowserGeolocationService.js.map