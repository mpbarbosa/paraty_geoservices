"use strict";
/**
 * Mock geolocation provider for tests and deterministic local development.
 *
 * Concrete infrastructure adapter that implements the domain port without
 * relying on browser APIs. It can be configured to return a fixed position,
 * surface a fixed error, simulate async delays, and fan out watch updates to
 * multiple active subscribers.
 *
 * `watchPosition()` intentionally schedules an immediate callback with the
 * current configured position or error, making it convenient for tests that
 * need an initial emission without a real device.
 *
 * @module infrastructure/providers/MockGeolocationProvider
 * @since 1.2.1
 * @author Marcelo Pereira Barbosa
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockGeolocationProvider = void 0;
const GeolocationProvider_1 = __importDefault(require("../../domain/ports/GeolocationProvider"));
/**
 * Mock implementation of the geolocation provider port.
 *
 * @class MockGeolocationProvider
 * @extends GeolocationProvider
 * @since 1.2.1
 */
class MockGeolocationProvider extends GeolocationProvider_1.default {
    constructor(config = {}) {
        super();
        this.watchIdCounter = 0;
        this.activeWatches = new Map();
        this.pendingTimeouts = new Set();
        this.config = {
            supported: config.supported ?? true,
            defaultPosition: config.defaultPosition ?? null,
            defaultError: config.defaultError ?? null,
            delay: config.delay ?? 0,
        };
    }
    /** @inheritdoc */
    getCurrentPosition(successCallback, errorCallback, _options) {
        if (!this.isSupported()) {
            this.scheduleCallback(() => {
                errorCallback(this.createUnsupportedError());
            });
            return;
        }
        this.scheduleCallback(() => {
            if (this.config.defaultError) {
                errorCallback(this.config.defaultError);
                return;
            }
            if (this.config.defaultPosition) {
                successCallback(this.config.defaultPosition);
                return;
            }
            errorCallback(this.createPositionUnavailableError());
        });
    }
    /** @inheritdoc */
    watchPosition(successCallback, errorCallback, _options) {
        if (!this.isSupported()) {
            return null;
        }
        const watchId = ++this.watchIdCounter;
        this.activeWatches.set(watchId, {
            successCallback,
            errorCallback,
        });
        this.scheduleCallback(() => {
            if (!this.activeWatches.has(watchId)) {
                return;
            }
            if (this.config.defaultError) {
                errorCallback(this.config.defaultError);
                return;
            }
            if (this.config.defaultPosition) {
                successCallback(this.config.defaultPosition);
            }
        });
        return watchId;
    }
    /** @inheritdoc */
    clearWatch(watchId) {
        this.activeWatches.delete(watchId);
    }
    /** @inheritdoc */
    isSupported() {
        return this.config.supported;
    }
    /**
     * Mirrors the browser adapter helper for API parity in tests.
     *
     * @returns Always `false`, because the mock has no real Permissions API.
     */
    isPermissionsAPISupported() {
        return false;
    }
    /**
     * Sets the position returned by future calls and clears any configured error.
     *
     * @param position - Position to return.
     */
    setPosition(position) {
        this.config.defaultPosition = position;
        this.config.defaultError = null;
    }
    /**
     * Sets the error returned by future calls and clears any configured position.
     *
     * @param error - Error to return.
     */
    setError(error) {
        this.config.defaultError = error;
        this.config.defaultPosition = null;
    }
    /**
     * Pushes a position update to all active watches.
     *
     * If no position is provided, the current configured default position is used.
     *
     * @param position - Optional position override for this update.
     */
    triggerWatchUpdate(position) {
        const positionToSend = position ?? this.config.defaultPosition;
        if (!positionToSend) {
            return;
        }
        for (const watch of this.activeWatches.values()) {
            watch.successCallback?.(positionToSend);
        }
    }
    /**
     * Pushes an error to all active watches.
     *
     * If no error is provided, the configured default error is used. When neither
     * exists, a target-compatible POSITION_UNAVAILABLE error is emitted.
     *
     * @param error - Optional error override for this update.
     */
    triggerWatchError(error) {
        const errorToSend = error ?? this.config.defaultError ?? this.createPositionUnavailableError();
        for (const watch of this.activeWatches.values()) {
            watch.errorCallback?.(errorToSend);
        }
    }
    /**
     * Clears all active watches and cancels scheduled callbacks.
     */
    destroy() {
        this.activeWatches.clear();
        for (const timeoutId of this.pendingTimeouts) {
            clearTimeout(timeoutId);
        }
        this.pendingTimeouts.clear();
    }
    scheduleCallback(fn) {
        const timeoutId = setTimeout(() => {
            this.pendingTimeouts.delete(timeoutId);
            fn();
        }, this.config.delay);
        this.pendingTimeouts.add(timeoutId);
    }
    createUnsupportedError() {
        return {
            code: 2,
            message: 'Geolocation is not supported',
        };
    }
    createPositionUnavailableError() {
        return {
            code: 2,
            message: 'Position unavailable',
        };
    }
}
exports.MockGeolocationProvider = MockGeolocationProvider;
//# sourceMappingURL=MockGeolocationProvider.js.map