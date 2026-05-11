/**
 * Browser-based geolocation provider.
 *
 * Concrete infrastructure adapter that delegates to the Web Geolocation API
 * (navigator.geolocation). Intended for browser environments only.
 *
 * NOTE: This file is an infrastructure adapter — it lives outside the domain
 * and application layers and depends on the browser runtime. Do not import it
 * in domain or application code.
 *
 * @module infrastructure/providers/BrowserGeolocationProvider
 * @since 1.0.1
 * @author Marcelo Pereira Barbosa
 */

import GeolocationProvider from '../../domain/ports/GeolocationProvider';
import type { GeoPosition } from '../../domain/entities/GeoPosition';
import type { GeoPositionError } from '../../domain/entities/GeoPositionError';
import type { GeoPositionOptions } from '../../domain/entities/GeoPositionOptions';

export class BrowserGeolocationProvider extends GeolocationProvider {
	/** @inheritdoc */
	getCurrentPosition(
		successCallback: (pos: GeoPosition) => void,
		errorCallback: (err: GeoPositionError) => void,
		options?: GeoPositionOptions,
	): void {
		navigator.geolocation.getCurrentPosition(
			successCallback as PositionCallback,
			errorCallback as PositionErrorCallback,
			options,
		);
	}

	/** @inheritdoc */
	watchPosition(
		successCallback: (pos: GeoPosition) => void,
		errorCallback: (err: GeoPositionError) => void,
		options?: GeoPositionOptions,
	): number {
		return navigator.geolocation.watchPosition(
			successCallback as PositionCallback,
			errorCallback as PositionErrorCallback,
			options,
		);
	}

	/** @inheritdoc */
	clearWatch(watchId: number): void {
		navigator.geolocation.clearWatch(watchId);
	}

	/** @inheritdoc */
	isSupported(): boolean {
		return typeof navigator !== 'undefined' && 'geolocation' in navigator;
	}
}
