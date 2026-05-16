"use strict";
/**
 * paraty_geoservices — Public API
 *
 * Re-exports all public types, ports, use cases and infrastructure adapters
 * from the Clean Architecture layers.
 *
 * @module index
 * @since 1.0.2
 * @author Marcelo Pereira Barbosa
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBrowserGeolocationService = exports.MockGeolocationProvider = exports.BrowserGeolocationProvider = exports.AwsGeocoder = exports.throttle = exports.ChangeDetectionCoordinator = exports.GeolocationService = exports.WatchPositionUseCase = exports.GetCurrentPositionUseCase = exports.GeolocationProvider = void 0;
var GeolocationProvider_1 = require("./domain/ports/GeolocationProvider");
Object.defineProperty(exports, "GeolocationProvider", { enumerable: true, get: function () { return GeolocationProvider_1.GeolocationProvider; } });
// Application — use cases, services & DTOs
var GetCurrentPositionUseCase_1 = require("./application/use-cases/GetCurrentPositionUseCase");
Object.defineProperty(exports, "GetCurrentPositionUseCase", { enumerable: true, get: function () { return GetCurrentPositionUseCase_1.GetCurrentPositionUseCase; } });
var WatchPositionUseCase_1 = require("./application/use-cases/WatchPositionUseCase");
Object.defineProperty(exports, "WatchPositionUseCase", { enumerable: true, get: function () { return WatchPositionUseCase_1.WatchPositionUseCase; } });
var GeolocationService_1 = require("./application/services/GeolocationService");
Object.defineProperty(exports, "GeolocationService", { enumerable: true, get: function () { return GeolocationService_1.GeolocationService; } });
var ChangeDetectionCoordinator_1 = require("./application/services/ChangeDetectionCoordinator");
Object.defineProperty(exports, "ChangeDetectionCoordinator", { enumerable: true, get: function () { return ChangeDetectionCoordinator_1.ChangeDetectionCoordinator; } });
// Utils
var throttle_1 = require("./utils/throttle");
Object.defineProperty(exports, "throttle", { enumerable: true, get: function () { return throttle_1.throttle; } });
// Infrastructure — concrete adapters
var AwsGeocoder_1 = require("./infrastructure/providers/AwsGeocoder");
Object.defineProperty(exports, "AwsGeocoder", { enumerable: true, get: function () { return AwsGeocoder_1.AwsGeocoder; } });
var BrowserGeolocationProvider_1 = require("./infrastructure/providers/BrowserGeolocationProvider");
Object.defineProperty(exports, "BrowserGeolocationProvider", { enumerable: true, get: function () { return BrowserGeolocationProvider_1.BrowserGeolocationProvider; } });
var MockGeolocationProvider_1 = require("./infrastructure/providers/MockGeolocationProvider");
Object.defineProperty(exports, "MockGeolocationProvider", { enumerable: true, get: function () { return MockGeolocationProvider_1.MockGeolocationProvider; } });
var createBrowserGeolocationService_1 = require("./infrastructure/createBrowserGeolocationService");
Object.defineProperty(exports, "createBrowserGeolocationService", { enumerable: true, get: function () { return createBrowserGeolocationService_1.createBrowserGeolocationService; } });
//# sourceMappingURL=index.js.map