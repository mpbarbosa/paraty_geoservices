/**
 * Pure address-mapping helpers for OpenStreetMap Nominatim reverse geocoding.
 *
 * @module infrastructure/providers/NominatimAddressMapper
 * @since 1.2.6
 */

import type { GeoAddress } from '../../domain/entities/GeoAddress';

/** Raw `address` object inside a Nominatim reverse-geocode JSON response. */
export interface NominatimAddressFields {
	road?: string;
	house_number?: string;
	suburb?: string;
	neighbourhood?: string;
	city?: string;
	town?: string;
	village?: string;
	municipality?: string;
	state?: string;
	region?: string;
	postcode?: string;
	country?: string;
	country_code?: string;
	[key: string]: unknown;
}

/** Top-level Nominatim reverse-geocode JSON response. */
export interface NominatimReverseResponse {
	display_name?: string;
	address?: NominatimAddressFields;
	[key: string]: unknown;
}

const BRAZIL_CODES = new Set(['br', 'bra', 'brasil', 'brazil']);

/**
 * Builds a Nominatim reverse-geocode request URL.
 */
export function buildNominatimReverseUrl(
	latitude: number,
	longitude: number,
	baseUrl: string,
	corsProxy: string | null = null,
): string {
	const nominatimUrl = `${baseUrl}&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
	return corsProxy ? `${corsProxy}${encodeURIComponent(nominatimUrl)}` : nominatimUrl;
}

/**
 * Maps a Nominatim reverse response to {@link GeoAddress}.
 */
export function toGeoAddressFromNominatim(
	raw: NominatimReverseResponse | null | undefined,
): GeoAddress {
	const address = raw?.address ?? {};
	const city =
		typeof address.city === 'string'
			? address.city
			: typeof address.town === 'string'
				? address.town
				: typeof address.village === 'string'
					? address.village
					: typeof address.municipality === 'string'
						? address.municipality
						: null;

	const neighborhood =
		typeof address.suburb === 'string'
			? address.suburb
			: typeof address.neighbourhood === 'string'
				? address.neighbourhood
				: null;

	const countryRaw =
		typeof address.country === 'string' ? address.country : 'Brasil';
	const countryCode =
		typeof address.country_code === 'string'
			? address.country_code.toLowerCase()
			: '';

	const country =
		BRAZIL_CODES.has(countryCode) ||
		BRAZIL_CODES.has(countryRaw.toLowerCase())
			? 'Brasil'
			: countryRaw;

	return {
		street: typeof address.road === 'string' ? address.road : null,
		streetNumber:
			typeof address.house_number === 'string' ? address.house_number : null,
		complement: null,
		neighborhood,
		city,
		metropolitanRegion:
			typeof address.region === 'string' ? address.region : null,
		state: typeof address.state === 'string' ? address.state : null,
		stateCode: null,
		postalCode:
			typeof address.postcode === 'string' ? address.postcode : null,
		country,
	};
}
