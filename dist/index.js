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
exports.MockGeolocationProvider = exports.BrowserGeolocationProvider = exports.WatchPositionUseCase = exports.GetCurrentPositionUseCase = exports.GeolocationProvider = void 0;
var GeolocationProvider_1 = require("./domain/ports/GeolocationProvider");
Object.defineProperty(exports, "GeolocationProvider", { enumerable: true, get: function () { return GeolocationProvider_1.GeolocationProvider; } });
// Application — use cases & DTOs
var GetCurrentPositionUseCase_1 = require("./application/use-cases/GetCurrentPositionUseCase");
Object.defineProperty(exports, "GetCurrentPositionUseCase", { enumerable: true, get: function () { return GetCurrentPositionUseCase_1.GetCurrentPositionUseCase; } });
var WatchPositionUseCase_1 = require("./application/use-cases/WatchPositionUseCase");
Object.defineProperty(exports, "WatchPositionUseCase", { enumerable: true, get: function () { return WatchPositionUseCase_1.WatchPositionUseCase; } });
// Infrastructure — concrete adapters
var BrowserGeolocationProvider_1 = require("./infrastructure/providers/BrowserGeolocationProvider");
Object.defineProperty(exports, "BrowserGeolocationProvider", { enumerable: true, get: function () { return BrowserGeolocationProvider_1.BrowserGeolocationProvider; } });
var MockGeolocationProvider_1 = require("./infrastructure/providers/MockGeolocationProvider");
Object.defineProperty(exports, "MockGeolocationProvider", { enumerable: true, get: function () { return MockGeolocationProvider_1.MockGeolocationProvider; } });
//# sourceMappingURL=index.js.map