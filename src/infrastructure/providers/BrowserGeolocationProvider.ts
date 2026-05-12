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

import GeolocationProvider from '../../domain/ports/GeolocationProvider';
import type { GeoPosition } from '../../domain/entities/GeoPosition';
import type { GeoPositionError } from '../../domain/entities/GeoPositionError';
import type { GeoPositionOptions } from '../../domain/entities/GeoPositionOptions';

/**
 * Concrete infrastructure adapter that delegates geolocation operations to the
 * browser's Web Geolocation API (`navigator.geolocation`).
 *
 * Supports dependency injection of a navigator object for testing and custom
 * runtimes. When constructed with no arguments, the global `navigator` is used
 * at call time, enabling accurate support detection in SSR or hybrid environments.
 *
 * Additionally exposes `isPermissionsAPISupported` and `getNavigator` as
 * convenience helpers for browser-specific introspection.
 *
 * @class BrowserGeolocationProvider
 * @extends GeolocationProvider
 * @since 1.0.2
 *
 * @example
 * // Real browser usage — uses global navigator automatically
 * const provider = new BrowserGeolocationProvider();
 *
 * @example
 * // Injected navigator for tests or custom runtimes
 * const provider = new BrowserGeolocationProvider(navigatorMock);
 */
export class BrowserGeolocationProvider extends GeolocationProvider {
	private readonly injectedNavigator: Navigator | null;
	private readonly useGlobalNavigator: boolean;

	constructor(navigatorObj?: Navigator | null) {
		super();
		this.useGlobalNavigator = arguments.length === 0;
		this.injectedNavigator = navigatorObj ?? null;
	}

	private resolveNavigator(): Navigator | null {
		if (this.useGlobalNavigator) {
			return typeof navigator !== 'undefined' ? navigator : null;
		}

		return this.injectedNavigator;
	}

	/** @inheritdoc */
	getCurrentPosition(
		successCallback: (pos: GeoPosition) => void,
		errorCallback: (err: GeoPositionError) => void,
		options?: GeoPositionOptions,
	): void {
		const activeNavigator = this.resolveNavigator();

		if (!this.isSupported() || !activeNavigator) {
			errorCallback({
				code: 2,
				message: 'Geolocation is not supported',
			});
			return;
		}

		activeNavigator.geolocation.getCurrentPosition(
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
	): number | null {
		const activeNavigator = this.resolveNavigator();

		if (!this.isSupported() || !activeNavigator) {
			return null;
		}

		return activeNavigator.geolocation.watchPosition(
			successCallback as PositionCallback,
			errorCallback as PositionErrorCallback,
			options,
		);
	}

	/** @inheritdoc */
	clearWatch(watchId: number): void {
		const activeNavigator = this.resolveNavigator();

		if (this.isSupported() && activeNavigator && watchId !== null) {
			activeNavigator.geolocation.clearWatch(watchId);
		}
	}

	/** @inheritdoc */
	isSupported(): boolean {
		const activeNavigator = this.resolveNavigator();
		return Boolean(activeNavigator && 'geolocation' in activeNavigator);
	}

	/**
	 * Checks whether the Permissions API is available in the current environment.
	 *
	 * @returns `true` if `navigator.permissions` exists; `false` otherwise.
	 */
	isPermissionsAPISupported(): boolean {
		const activeNavigator = this.resolveNavigator();
		return Boolean(activeNavigator && 'permissions' in activeNavigator);
	}

	/**
	 * Returns the active navigator instance used by this provider.
	 *
	 * Returns the injected navigator when one was supplied at construction, the
	 * global `navigator` when the provider was constructed with no arguments, or
	 * `null` when no navigator is available.
	 *
	 * @returns The active `Navigator` object, or `null`.
	 */
	getNavigator(): Navigator | null {
		return this.resolveNavigator();
	}
}
