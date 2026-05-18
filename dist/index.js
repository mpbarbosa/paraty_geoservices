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
exports.NominatimGeocoder = exports.createReverseGeocoderService = exports.createBrowserGeolocationService = exports.MockReverseGeocoder = exports.MockGeolocationProvider = exports.BrowserGeolocationProvider = exports.AwsGeocoder = exports.throttle = exports.IMMEDIATE_ADDRESS_UPDATE_EVENT = exports.POSITION_UPDATE_EVENT = exports.GEOCODING_ERROR_EVENT = exports.ADDRESS_FETCHED_EVENT = exports.ReverseGeocoderService = exports.ChangeDetectionCoordinator = exports.GeolocationService = exports.WatchPositionUseCase = exports.GetCurrentPositionUseCase = exports.GeolocationProvider = exports.createGeoReverseGeocodeError = void 0;
var GeoReverseGeocodeError_1 = require("./domain/entities/GeoReverseGeocodeError");
Object.defineProperty(exports, "createGeoReverseGeocodeError", { enumerable: true, get: function () { return GeoReverseGeocodeError_1.createGeoReverseGeocodeError; } });
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
/** Full orchestrator (Nominatim + AWS + observers); distinct from the {@link ReverseGeocoder} port. */
var ReverseGeocoder_1 = require("./application/services/ReverseGeocoder");
Object.defineProperty(exports, "ReverseGeocoderService", { enumerable: true, get: function () { return ReverseGeocoder_1.ReverseGeocoder; } });
var reverseGeocoderEvents_1 = require("./application/services/reverseGeocoderEvents");
Object.defineProperty(exports, "ADDRESS_FETCHED_EVENT", { enumerable: true, get: function () { return reverseGeocoderEvents_1.ADDRESS_FETCHED_EVENT; } });
Object.defineProperty(exports, "GEOCODING_ERROR_EVENT", { enumerable: true, get: function () { return reverseGeocoderEvents_1.GEOCODING_ERROR_EVENT; } });
Object.defineProperty(exports, "POSITION_UPDATE_EVENT", { enumerable: true, get: function () { return reverseGeocoderEvents_1.POSITION_UPDATE_EVENT; } });
Object.defineProperty(exports, "IMMEDIATE_ADDRESS_UPDATE_EVENT", { enumerable: true, get: function () { return reverseGeocoderEvents_1.IMMEDIATE_ADDRESS_UPDATE_EVENT; } });
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
var MockReverseGeocoder_1 = require("./infrastructure/providers/MockReverseGeocoder");
Object.defineProperty(exports, "MockReverseGeocoder", { enumerable: true, get: function () { return MockReverseGeocoder_1.MockReverseGeocoder; } });
var createBrowserGeolocationService_1 = require("./infrastructure/createBrowserGeolocationService");
Object.defineProperty(exports, "createBrowserGeolocationService", { enumerable: true, get: function () { return createBrowserGeolocationService_1.createBrowserGeolocationService; } });
var createReverseGeocoderService_1 = require("./infrastructure/createReverseGeocoderService");
Object.defineProperty(exports, "createReverseGeocoderService", { enumerable: true, get: function () { return createReverseGeocoderService_1.createReverseGeocoderService; } });
var NominatimGeocoder_1 = require("./infrastructure/providers/NominatimGeocoder");
Object.defineProperty(exports, "NominatimGeocoder", { enumerable: true, get: function () { return NominatimGeocoder_1.NominatimGeocoder; } });
//# sourceMappingURL=index.js.map