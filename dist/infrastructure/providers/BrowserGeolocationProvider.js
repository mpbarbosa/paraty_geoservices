"use strict";
/**
 * Browser-based geolocation provider.
 *
 * Concrete infrastructure adapter that delegates to the Web Geolocation API
 * (`navigator.geolocation`). Intended for browser environments, but supports
 * dependency injection of a navigator object for tests and custom runtimes.
 *
 * NOTE: This file is an infrastructure adapter — it lives outside the domain
 * and application layers and depends on the browser runtime. Do not import it
 * in domain or application code.
 *
 * @module infrastructure/providers/BrowserGeolocationProvider
 * @since 1.0.2
 * @author Marcelo Pereira Barbosa
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserGeolocationProvider = void 0;
const GeolocationProvider_1 = __importDefault(require("../../domain/ports/GeolocationProvider"));
class BrowserGeolocationProvider extends GeolocationProvider_1.default {
    constructor(navigatorObj) {
        super();
        this.useGlobalNavigator = arguments.length === 0;
        this.injectedNavigator = navigatorObj ?? null;
    }
    resolveNavigator() {
        if (this.useGlobalNavigator) {
            return typeof navigator !== 'undefined' ? navigator : null;
        }
        return this.injectedNavigator;
    }
    /** @inheritdoc */
    getCurrentPosition(successCallback, errorCallback, options) {
        const activeNavigator = this.resolveNavigator();
        if (!this.isSupported() || !activeNavigator) {
            errorCallback({
                code: 2,
                message: 'Geolocation is not supported',
            });
            return;
        }
        activeNavigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
    }
    /** @inheritdoc */
    watchPosition(successCallback, errorCallback, options) {
        const activeNavigator = this.resolveNavigator();
        if (!this.isSupported() || !activeNavigator) {
            return null;
        }
        return activeNavigator.geolocation.watchPosition(successCallback, errorCallback, options);
    }
    /** @inheritdoc */
    clearWatch(watchId) {
        const activeNavigator = this.resolveNavigator();
        if (this.isSupported() && activeNavigator && watchId !== null) {
            activeNavigator.geolocation.clearWatch(watchId);
        }
    }
    /** @inheritdoc */
    isSupported() {
        const activeNavigator = this.resolveNavigator();
        return Boolean(activeNavigator && 'geolocation' in activeNavigator);
    }
    isPermissionsAPISupported() {
        const activeNavigator = this.resolveNavigator();
        return Boolean(activeNavigator && 'permissions' in activeNavigator);
    }
    getNavigator() {
        return this.resolveNavigator();
    }
}
exports.BrowserGeolocationProvider = BrowserGeolocationProvider;
//# sourceMappingURL=BrowserGeolocationProvider.js.map