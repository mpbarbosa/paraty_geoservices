/**
 * Browser-oriented factory for the high-level geolocation service.
 *
 * Keeps browser-specific provider construction in the infrastructure layer while
 * preserving a convenient entry point for browser consumers.
 *
 * @module infrastructure/createBrowserGeolocationService
 * @since 1.5.0
 * @author Marcelo Pereira Barbosa
 */

import { GeolocationService } from '../application/services/GeolocationService';
import type { GeolocationServiceConfig } from '../application/services/GeolocationService';
import { BrowserGeolocationProvider } from './providers/BrowserGeolocationProvider';

export interface CreateBrowserGeolocationServiceConfig extends GeolocationServiceConfig {
	navigator?: Navigator | null;
}

/**
 * Creates a `GeolocationService` pre-wired with `BrowserGeolocationProvider`.
 *
 * When `navigator` is omitted, the provider resolves the ambient global
 * `navigator` at call time. When the property is present, its value is used
 * exactly as supplied, including `null` or `undefined`.
 */
export function createBrowserGeolocationService(
	config: CreateBrowserGeolocationServiceConfig = {},
): GeolocationService {
	const { navigator: injectedNavigator, ...serviceConfig } = config;
	const hasNavigatorOverride = Object.prototype.hasOwnProperty.call(config, 'navigator');
	const provider = hasNavigatorOverride
		? new BrowserGeolocationProvider(injectedNavigator)
		: new BrowserGeolocationProvider();

	return new GeolocationService(provider, serviceConfig);
}
