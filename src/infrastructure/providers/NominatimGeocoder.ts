/**
 * OpenStreetMap Nominatim reverse geocoding adapter.
 *
 * @module infrastructure/providers/NominatimGeocoder
 * @since 1.2.6
 */

import type { GeoAddress } from '../../domain/entities/GeoAddress';
import { createGeoReverseGeocodeError } from '../../domain/entities/GeoReverseGeocodeError';
import type { ReverseGeocoder } from '../../domain/ports/ReverseGeocoder';
import {
	buildNominatimReverseUrl,
	toGeoAddressFromNominatim,
	type NominatimReverseResponse,
} from './NominatimAddressMapper';

/** Legacy fetch manager used by ported guia_js integrations. */
export interface LegacyFetchManager {
	fetch(url: string): Promise<unknown>;
	subscribe(observer: unknown, url: string): void;
	observers?: unknown[];
}

export interface NominatimGeocoderConfig {
	nominatimApiUrl?: string;
	openstreetmapBaseUrl?: string;
	corsProxy?: string | null;
	enableCorsFallback?: boolean;
	fetchFn?: typeof fetch;
	legacyFetchManager?: LegacyFetchManager | null;
}

const DEFAULT_NOMINATIM_API = 'https://nominatim.openstreetmap.org';
const DEFAULT_CORS_PROXY = 'https://api.allorigins.win/raw?url=';

/**
 * Reverse geocoder for the OpenStreetMap Nominatim API.
 */
export class NominatimGeocoder implements ReverseGeocoder {
	readonly baseUrl: string;
	private corsProxy: string | null;
	private readonly enableCorsFallback: boolean;
	private readonly fetchFn: typeof fetch;
	private readonly legacyFetchManager: LegacyFetchManager | null;
	private _corsRetryAttempted = false;
	lastRequestUrl: string | null = null;

	constructor(config: NominatimGeocoderConfig = {}) {
		const nominatimBase = config.nominatimApiUrl ?? DEFAULT_NOMINATIM_API;
		this.baseUrl =
			config.openstreetmapBaseUrl ??
			`${nominatimBase}/reverse?format=json`;
		this.corsProxy = config.corsProxy ?? null;
		this.enableCorsFallback = config.enableCorsFallback ?? false;
		this.fetchFn = config.fetchFn ?? fetch;
		this.legacyFetchManager = config.legacyFetchManager ?? null;
	}

	buildUrl(latitude: number, longitude: number): string {
		return buildNominatimReverseUrl(
			latitude,
			longitude,
			this.baseUrl,
			this.corsProxy,
		);
	}

	async reverseGeocode(
		latitude: number,
		longitude: number,
	): Promise<GeoAddress> {
		if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
			throw createGeoReverseGeocodeError(
				1,
				'(NominatimGeocoder) Invalid coordinates',
			);
		}

		try {
			return await this.fetchAndMap(latitude, longitude);
		} catch (err) {
			if (this.shouldRetryWithCorsProxy(err)) {
				return this.retryWithCorsProxy(latitude, longitude);
			}
			throw err;
		}
	}

	private async fetchAndMap(
		latitude: number,
		longitude: number,
	): Promise<GeoAddress> {
		const url = this.buildUrl(latitude, longitude);
		this.lastRequestUrl = url;

		const raw = await this.fetchRaw(url);
		return toGeoAddressFromNominatim(raw as NominatimReverseResponse);
	}

	private async fetchRaw(url: string): Promise<unknown> {
		if (this.legacyFetchManager) {
			try {
				return await this.legacyFetchManager.fetch(url);
			} catch (err) {
				const message = err instanceof Error ? err.message : String(err);
				throw createGeoReverseGeocodeError(
					2,
					`(NominatimGeocoder) ${message}`,
				);
			}
		}

		let response: Response;
		try {
			response = await this.fetchFn(url);
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			throw createGeoReverseGeocodeError(
				2,
				`(NominatimGeocoder) Network error: ${message}`,
			);
		}

		if (!response.ok) {
			throw createGeoReverseGeocodeError(
				3,
				`(NominatimGeocoder) HTTP ${response.status}: ${response.statusText}`,
			);
		}

		try {
			return await response.json();
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			throw createGeoReverseGeocodeError(
				3,
				`(NominatimGeocoder) Invalid JSON: ${message}`,
			);
		}
	}

	private shouldRetryWithCorsProxy(err: unknown): boolean {
		if (!this.enableCorsFallback || this._corsRetryAttempted) {
			return false;
		}
		const message = err instanceof Error ? err.message : String(err);
		return (
			message.includes('CORS') ||
			message.includes('Failed to fetch') ||
			message.includes('Network error')
		);
	}

	private async retryWithCorsProxy(
		latitude: number,
		longitude: number,
	): Promise<GeoAddress> {
		this._corsRetryAttempted = true;
		const previousProxy = this.corsProxy;
		this.corsProxy = DEFAULT_CORS_PROXY;

		try {
			return await this.fetchAndMap(latitude, longitude);
		} finally {
			this.corsProxy = previousProxy;
			this._corsRetryAttempted = false;
		}
	}

	/** Subscribes legacy fetch-manager observers to the last built URL. */
	subscribeLegacyObservers(observers: unknown[], url: string): void {
		if (!this.legacyFetchManager) {
			return;
		}
		for (const observer of observers) {
			this.legacyFetchManager.subscribe(observer, url);
		}
	}
}
